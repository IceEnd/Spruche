"use strict";

var crypto = require('crypto'),
    request = require('request'),
    pkg = require("./package.json");

var md5 = function (str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
};

var randint = function (from, to) {
    // range: from ~ to
    return Math.floor(Math.random() * (to - from + 1) + from);
};

function Geetest(config) {
    if (!config.privateKey) {
        throw new Error('Private Key Required');
    }
    if (!config.publicKey) {
        throw new Error("Public Key Required");
    }
    if (config.protocol) {
        this.PROTOCOL = config.protocol;
    }
    if (config.apiServer) {
        this.API_SERVER = config.apiServer;
    }

    this.privateKey = config.privateKey;
    this.publicKey = config.publicKey;
}

Geetest.prototype = {

    PROTOCOL: 'http://',
    API_SERVER: 'api.geetest.com',
    VALIDATE_PATH: '/validate.php',
    REGISTER_PATH: '/register.php',

    validate: function (result, callback) {
        var that = this;

        return new Promise(function (resolve, reject) {

            that._validate(result, function (err, data) {
                if (typeof callback === 'function') {
                    callback(err, data);
                }
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
    },

    _validate: function (result, callback) {
        var challenge = result.challenge;
        var validate = result.validate;

        if (validate.split('_').length === 3) {

            var validate_strs = validate.split('_');
            var encode_ans = validate_strs[0];
            var encode_fbii = validate_strs[1];
            var encode_igi = validate_strs[2];

            var decode_ans = this._decode_response(challenge, encode_ans);
            var decode_fbii = this._decode_response(challenge, encode_fbii);
            var decode_igi = this._decode_response(challenge, encode_igi);

            var validate_result = this._validate_fail_image(decode_ans, decode_fbii, decode_igi);

            if (validate_result === 1) {
                callback(null, true);
            } else {
                callback(null, false);
            }

        } else {

            var hash = this.privateKey + 'geetest' + result.challenge;
            if (result.validate === md5(hash)) {
                var url = this.PROTOCOL + this.API_SERVER + this.VALIDATE_PATH;

                request.post(url, {
                    form: {
                        seccode: result.seccode
                    }
                }, function (err, res, body) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, body === md5(result.seccode));
                    }
                });
            } else {
                callback(null, false);
            }
        }
    },

    _validate_fail_image: function (ans, full_bg_index, img_grp_index) {

        var thread = 3;
        var full_bg_name = md5(full_bg_index).slice(0, 10);
        var bg_name = md5(img_grp_index).slice(10,20);
        var answer_decode = '';
        var i;
        for (i = 0; i < 9; i = i + 1) {
            if (i % 2 == 0) {
                answer_decode += full_bg_name[i];
            } else {
                answer_decode += bg_name[i];
            }
        }
        var x_decode = answer_decode.slice(4);
        var x_int = parseInt(x_decode, 16);
        var result = x_int % 200;
        if (result < 40) {
            result = 40;
        }
        if (Math.abs(ans - result) < thread) {
            return 1;
        } else {
            return 0;
        }
    },

    _decode_response: function (challenge, userresponse) {
        if (userresponse.length > 100) {
            return 0;
        }
        var shuzi = [1,2,5,10,50];
        var chongfu = [];
        var key = {};
        var count = 0, i, len;
        for (i = 0, len = challenge.length; i < len; i =i + 1) {
            var c = challenge[i];
            if (chongfu.indexOf(c) === -1) {
                chongfu.push(c);
                key[c] = shuzi[count % 5];
                count += 1;
            }
        }
        var res = 0;
        for (i = 0, len = userresponse.length; i < len; i = i + 1) {
            res += key[userresponse[i]] || 0;
        }
        res = res - this._decode_rand_base(challenge);
        return res;
    },

    _decode_rand_base: function (challenge) {
        var str_base = challenge.slice(32);
        var i, len, temp_array = [];
        for (i = 0, len = str_base.length; i < len; i = i + 1) {
            var temp_char = str_base[i];
            var temp_ascii = temp_char.charCodeAt(0);
            var result = temp_ascii > 57 ? temp_ascii - 87 : temp_ascii - 48;
            temp_array.push(result);
        }
        var decode_res = temp_array[0] * 36 + temp_array[1];
        return decode_res;
    },


    register: function (callback) {

        var that = this;
        return new Promise(function (resolve) {
            that._register(function (data) {
                if (typeof callback === 'function') {
                    callback(data);
                }
                resolve(data);
            });
        });
    },

    _register: function (callback) {
        var url = this.PROTOCOL + this.API_SERVER + this.REGISTER_PATH
            + '?gt=' + this.publicKey + '&sdk=Node_' + pkg.version;

        var that = this;
        request.get(url, {timeout: 2000}, function (err, res, challenge) {

            if (err || challenge.length !== 32) {

                // api.geetest.com 宕机

                callback({
                    success: 0,
                    challenge: that._make_challenge()
                });

            } else {

                callback({
                    success: 1,
                    challenge: md5(challenge + that.privateKey)
                });
            }
        });
    },

    _make_challenge: function () {
        var rnd1 = randint(0,90);
        var rnd2 = randint(0,90);
        var md5_str1 = md5(rnd1);
        var md5_str2 = md5(rnd2);

        return md5_str1 + md5_str2.slice(0,2);
    }
};

module.exports = Geetest;