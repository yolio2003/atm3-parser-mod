var fs = require('fs')
var path = require('./path')

exports.read = function(thepath) {
    return fs.readFileSync(thepath, {encoding: 'utf-8'})
}

exports.write = function(thepath, thedata) {
    return fs.writeFileSync(thepath, thedata, {encoding: 'utf-8'})
}

exports.exists = function(thepath) {
    return fs.existsSync(thepath)
}

exports.del = function(thepath) {
    return fs.unlinkSync(thepath)
}

exports.home = path.resolve.bind(null, process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'])
