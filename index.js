var fs = require('./fs')
var path = require('./path')
var lodash = require('./lodash.min')

var dbhtml = {}

var confHash = fis.config.get('mod')
confHash.project = path.resolve(fis.project.getProjectPath())
// name mod sub project

module.exports = function(content, file, conf) {

    var modArray = []
    parseMod(modArray, content)

    dbhtml[file.realpath] = {
        // html: file.realpath,
        sub: parseProject(content),
        mod: modArray,
    }

    makeData()
    makeSCSS(makeSubMod())


    return content
}

var parseProject = function(modSource) {
    var result = []
    // console.log(modSource, 123)
    var modRe = /<!--[\S\s]*?-->|<meta\s+name\s*=\s*(["'])sub\1\s+content\s*=\s*(["'])(.+?)\2\s*\/*>/g
    modSource.replace(modRe, function(m0, m1, m2, m3, m4, m5, m6) {
        // console.log(m3)
        // console.log(m3.split(/[,\s\xA0]+/g))
        if (m3) {
            // console.log(m3)
            result = lodash.uniq(m3.split(/[,\s\xA0]+/g))
        }

    })
    return result
}

var parseMod = function(modArray, modSource) {
    var modRe = /<!--[\S\s]*?-->|<component\s+is\s*=\s*(["'])(.+?)\1(\s*load\s*=\s*(["'])(.+?)\4)*/g
    modSource.replace(modRe, function(m0, m1, m2, m3, m4, m5, m6) {
        var modName = lodash.trim(m2 || '')
        if (modName === '') return false
        modArray.push(modName)

        var deppath = path.resolve(confHash.mod, modName, 'index.html')

        if (fs.exists(deppath)) {
            parseMod(modArray, fs.read(deppath))
        } else {
            fis.log.info('mod not found', deppath)
        }
    })
}

var makeData = function() {
    var datapath = fs.home('__data4mod__' + confHash.name + '.js')
    fs.write( datapath, JSON.stringify( dbhtml ) )
}

var makeSubMod = function() {

    var subMod = {}

    lodash(dbhtml)
        .chain()
        .each(function(v, k) {
            // fis.log.info(v)
            lodash.each(v.sub, function(vv, kk) {
                subMod[vv] = subMod[vv] || []
                subMod[vv] = subMod[vv].concat(v.mod)
            })
        })
        .run();

    lodash.each(subMod, function(v, k) {
        if ( lodash.includes(subMod[k], 'css-base') ) {
            lodash.pull(subMod[k], 'css-base')
            subMod[k].push('css-base')
        }

        if ( lodash.includes(subMod[k], 'css-reset') ) {
            lodash.pull(subMod[k], 'css-reset')
            subMod[k].push('css-reset')
        }

        subMod[k].reverse()
        subMod[k] = lodash.uniq(subMod[k])
    })
    // fis.log.info(subMod)
    return subMod
}

var makeSCSS = function(submod) {
    // fis.log.info(submod)
    lodash.each(submod, function(v, k) {
        var result = []

        lodash.each(v, function(v, k) {
            // console.log(v, k)
            var deppath = path.resolve(
                confHash.mod,
                v,
                'index.scss'
            )

            if (fs.exists(deppath)) {
                result.push(
                    '@import "'+ deppath +'";'
                )
            } else {
                fis.log.info('mod not found', deppath)
            }
        })

        if (confHash.sub[k]) {
            fs.write(
                path.resolve(
                    confHash.project,
                    confHash.sub[k]
                ),
                result.join('\n')
            )
        }
    })
}

    // console.log(fis.config.get('mod'))

// if (!content || !content.trim()) {
//     return content
// }

// var content = fs.read(v)
// var content = fs.read(confHash.project + v)

// if (file.tcdona) {
//     console.log(file.realpath)
// }

// var timer = null
// if (timer) {
//     clearTimeout(timer)
//     timer = null
// }
// timer = setTimeout(function() {
//     console.log(fis.config.get('mod'))
//     console.log(a++)
// }, 10000)
