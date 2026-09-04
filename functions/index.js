const functions = require('firebase-functions/v1');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldPath, FieldValue, Timestamp } = require('firebase-admin/firestore');

initializeApp();

const db = getFirestore();
const BATCH_SIZE = 500;
const COMPLETION_DELAY_MS = 15 * 60 * 1000;
const PHILIPPINES_OFFSET_MS = 8 * 60 * 60 * 1000;

exports.completeTransactions = functions
  .region('us-central1')
  .runWith({ timeoutSeconds: 540, memory: '256MB' })
  .pubsub.schedule('every 15 minutes')
  .timeZone('Asia/Manila')
  .onRun(async () => {
    const nowMs = Date.now();
    const philippinesNow = new Date(nowMs + PHILIPPINES_OFFSET_MS);
    const startOfTodayMs = Date.UTC(
      philippinesNow.getUTCFullYear(),
      philippinesNow.getUTCMonth(),
      philippinesNow.getUTCDate(),
    ) - PHILIPPINES_OFFSET_MS;
    const completionCutoffMs = nowMs - COMPLETION_DELAY_MS;

    if (completionCutoffMs < startOfTodayMs) {
      functions.logger.info('No transactions are old enough to complete today.');
      return;
    }

    const startOfToday = Timestamp.fromMillis(startOfTodayMs);
    const completionCutoff = Timestamp.fromMillis(completionCutoffMs);
    let lastDocument;
    let updatedCount = 0;

    do {
      let query = db
        .collection('transactions')
        .where('createdAt', '>=', startOfToday)
        .where('createdAt', '<=', completionCutoff)
        .orderBy('createdAt')
        .orderBy(FieldPath.documentId())
        .limit(BATCH_SIZE);

      if (lastDocument) {
        query = query.startAfter(lastDocument);
      }

      const snapshot = await query.get();
      if (snapshot.empty) {
        break;
      }

      const batch = db.batch();
      let batchUpdateCount = 0;

      for (const document of snapshot.docs) {
        if (document.get('status') === 'completed') {
          continue;
        }

        batch.update(document.ref, {
          status: 'completed',
          updatedAt: FieldValue.serverTimestamp(),
        });
        batchUpdateCount += 1;
      }

      if (batchUpdateCount > 0) {
        await batch.commit();
        updatedCount += batchUpdateCount;
      }

      lastDocument = snapshot.docs[snapshot.docs.length - 1];
      if (snapshot.size < BATCH_SIZE) {
        break;
      }
    } while (lastDocument);

    functions.logger.info('Today\'s transaction completion schedule finished.', {
      completionCutoff: completionCutoff.toDate().toISOString(),
      startOfToday: startOfToday.toDate().toISOString(),
      updatedCount,
    });
  });