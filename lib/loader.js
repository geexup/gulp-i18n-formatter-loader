module.exports = function (source) {
    const loaderContext = this;

    console.log('loaderContext', loaderContext);
    console.log('source', source);
};