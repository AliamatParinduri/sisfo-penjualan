const path = require('path');
const rootDir = require('../util/path');

const errorNotFound = (req,res,next) => {
    res.render(path.join(rootDir, "src", "views", "404"), {
        pageTitle: 'test',
        path: '404',
    });
};

module.exports = {errorNotFound};