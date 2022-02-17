const path = require('path');
const rootDir = require('../util/path');

const errorNotFound = (req,res,next) => {
    res.render(path.join(rootDir, "src", "views", "404"), {
        pageTitle: 'Not Found',
        path: '404',
    });
};

const error500 = (req,res,next) => {
    res.render(path.join(rootDir, "src", "views", "500"), {
        pageTitle: 'Not Process',
        path: '500',
    });
};

module.exports = {errorNotFound,error500};