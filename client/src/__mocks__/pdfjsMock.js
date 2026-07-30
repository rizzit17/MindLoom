module.exports = {
  GlobalWorkerOptions: { workerSrc: '' },
  version: '4.0.0',
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: () =>
        Promise.resolve({
          getTextContent: () => Promise.resolve({ items: [{ str: 'Sample PDF content' }] }),
        }),
    }),
  }),
};
