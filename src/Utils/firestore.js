const { Firestore } = require("@google-cloud/firestore");

// Create a Firestore client
const firestore = new Firestore({ databaseId: "apaaja" });

/**
 * Adding new data to database, use this function to add new data.
 *
 * @param {*} collectionId Server ID to fetch the correct document
 * @param {*} documentId Document ID find the correct document and retrieve its data
 * @param {Array} data Data to add to database
 */
async function addData(collectionId, documentId, data) {
  const docRef = firestore.collection(`${collectionId}`).doc(`${documentId}`);
  await docRef.set(data);
  console.log("[ Firestore ] Document written successfully!");
}

/**
 * Read data and return its content, if there is no data or document it will return null
 *
 * @param {*} collectionId Server ID to fetch the correct document
 * @param {*} documentId Document ID find the correct document and retrieve its data
 * @returns data | null
 */
async function readData(collectionId, documentId) {
  const docRef = firestore.collection(`${collectionId}`).doc(`${documentId}`);
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log("[ Firestore ] No such document!");
    return null;
  }

  console.log("[ Firestore ] Document found!");
  return doc.data();
}

/**
 *
 * @param {*} collectionId Server ID to fetch the correct document
 * @param {*} documentId Document ID find the correct document and retrieve its data
 * @param {*} data Data to update
 */
async function updateData(collectionId, documentId, data) {
  const docRef = firestore.collection(`${collectionId}`).doc(`${documentId}`);
  await docRef.update(data);
  console.log("[ Firestore ] Document updated successfully!");
}

/**
 *
 * @param {*} collectionId Server ID to fetch the correct document
 * @param {*} documentId Document ID find the correct document and retrieve its data
 */
async function deleteData(collectionId, documentId) {
  const docRef = firestore.collection(`${collectionId}`).doc(`${documentId}`);
  await docRef.delete();
  console.log("[ Firestore ] Document deleted successfully!");
}

module.exports = { addData, readData, updateData, deleteData };
