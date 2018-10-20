const test = require('tape')
const testCommon = require('./common')

let db

test('setUp common', testCommon.setUp)

test('setUp db', function (t) {
  db = testCommon.factory()
  db.open(t.end.bind(t))
})

test('test compactRange() frees disk space after key deletion', function (t) {
  var key1 = '000000'
  var key2 = '000001'
  var val1 = Buffer.allocUnsafe(64).fill(1)
  var val2 = Buffer.allocUnsafe(64).fill(1)

  // TODO: use batch()
  db.put(key1, val1, function (err) {
    t.ifError(err, 'no put1 error')

    db.put(key2, val2, function (err) {
      t.ifError(err, 'no put2 error')

      db.compactRange(key1, key2, function (err) {
        t.ifError(err, 'no compactRange1 error')

        db.approximateSize('0', 'z', function (err, sizeAfterPuts) {
          t.error(err, 'no approximateSize1 error')

          // TODO: use batch()
          db.del(key1, function (err) {
            t.ifError(err, 'no del1 error')

            db.del(key2, function (err) {
              t.ifError(err, 'no del2 error')

              db.compactRange(key1, key2, function (err) {
                t.ifError(err, 'no compactRange2 error')

                db.approximateSize('0', 'z', function (err, sizeAfterCompact) {
                  t.error(err, 'no approximateSize2 error')
                  t.ok(sizeAfterCompact < sizeAfterPuts)
                  t.end()
                })
              })
            })
          })
        })
      })
    })
  })
})

test('tearDown', function (t) {
  db.close(testCommon.tearDown.bind(null, t))
})
