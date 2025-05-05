import { c as commonjsGlobal, r as requireLib$1, a as commonjsRequire, g as getDefaultExportFromCjs } from "./main-Cwtj728o.js";
import require$$0 from "url";
import require$$0$7 from "net";
import require$$1$1 from "tls";
import require$$1 from "timers";
import require$$0$4 from "events";
import require$$0$6 from "stream";
import require$$0$1 from "buffer";
import require$$0$3 from "process";
import require$$0$2 from "crypto";
import require$$6 from "zlib";
import require$$0$5 from "util";
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
var mysql2 = {};
var SqlString$2 = {};
(function(exports) {
  var SqlString2 = exports;
  var ID_GLOBAL_REGEXP = /`/g;
  var QUAL_GLOBAL_REGEXP = /\./g;
  var CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g;
  var CHARS_ESCAPE_MAP = {
    "\0": "\\0",
    "\b": "\\b",
    "	": "\\t",
    "\n": "\\n",
    "\r": "\\r",
    "": "\\Z",
    '"': '\\"',
    "'": "\\'",
    "\\": "\\\\"
  };
  SqlString2.escapeId = function escapeId(val, forbidQualified) {
    if (Array.isArray(val)) {
      var sql = "";
      for (var i = 0; i < val.length; i++) {
        sql += (i === 0 ? "" : ", ") + SqlString2.escapeId(val[i], forbidQualified);
      }
      return sql;
    } else if (forbidQualified) {
      return "`" + String(val).replace(ID_GLOBAL_REGEXP, "``") + "`";
    } else {
      return "`" + String(val).replace(ID_GLOBAL_REGEXP, "``").replace(QUAL_GLOBAL_REGEXP, "`.`") + "`";
    }
  };
  SqlString2.escape = function escape(val, stringifyObjects, timeZone) {
    if (val === void 0 || val === null) {
      return "NULL";
    }
    switch (typeof val) {
      case "boolean":
        return val ? "true" : "false";
      case "number":
        return val + "";
      case "object":
        if (Object.prototype.toString.call(val) === "[object Date]") {
          return SqlString2.dateToString(val, timeZone || "local");
        } else if (Array.isArray(val)) {
          return SqlString2.arrayToList(val, timeZone);
        } else if (Buffer.isBuffer(val)) {
          return SqlString2.bufferToString(val);
        } else if (typeof val.toSqlString === "function") {
          return String(val.toSqlString());
        } else if (stringifyObjects) {
          return escapeString(val.toString());
        } else {
          return SqlString2.objectToValues(val, timeZone);
        }
      default:
        return escapeString(val);
    }
  };
  SqlString2.arrayToList = function arrayToList(array, timeZone) {
    var sql = "";
    for (var i = 0; i < array.length; i++) {
      var val = array[i];
      if (Array.isArray(val)) {
        sql += (i === 0 ? "" : ", ") + "(" + SqlString2.arrayToList(val, timeZone) + ")";
      } else {
        sql += (i === 0 ? "" : ", ") + SqlString2.escape(val, true, timeZone);
      }
    }
    return sql;
  };
  SqlString2.format = function format(sql, values, stringifyObjects, timeZone) {
    if (values == null) {
      return sql;
    }
    if (!Array.isArray(values)) {
      values = [values];
    }
    var chunkIndex = 0;
    var placeholdersRegex = /\?+/g;
    var result = "";
    var valuesIndex = 0;
    var match;
    while (valuesIndex < values.length && (match = placeholdersRegex.exec(sql))) {
      var len = match[0].length;
      if (len > 2) {
        continue;
      }
      var value = len === 2 ? SqlString2.escapeId(values[valuesIndex]) : SqlString2.escape(values[valuesIndex], stringifyObjects, timeZone);
      result += sql.slice(chunkIndex, match.index) + value;
      chunkIndex = placeholdersRegex.lastIndex;
      valuesIndex++;
    }
    if (chunkIndex === 0) {
      return sql;
    }
    if (chunkIndex < sql.length) {
      return result + sql.slice(chunkIndex);
    }
    return result;
  };
  SqlString2.dateToString = function dateToString(date, timeZone) {
    var dt = new Date(date);
    if (isNaN(dt.getTime())) {
      return "NULL";
    }
    var year;
    var month;
    var day;
    var hour;
    var minute;
    var second;
    var millisecond;
    if (timeZone === "local") {
      year = dt.getFullYear();
      month = dt.getMonth() + 1;
      day = dt.getDate();
      hour = dt.getHours();
      minute = dt.getMinutes();
      second = dt.getSeconds();
      millisecond = dt.getMilliseconds();
    } else {
      var tz = convertTimezone(timeZone);
      if (tz !== false && tz !== 0) {
        dt.setTime(dt.getTime() + tz * 6e4);
      }
      year = dt.getUTCFullYear();
      month = dt.getUTCMonth() + 1;
      day = dt.getUTCDate();
      hour = dt.getUTCHours();
      minute = dt.getUTCMinutes();
      second = dt.getUTCSeconds();
      millisecond = dt.getUTCMilliseconds();
    }
    var str = zeroPad(year, 4) + "-" + zeroPad(month, 2) + "-" + zeroPad(day, 2) + " " + zeroPad(hour, 2) + ":" + zeroPad(minute, 2) + ":" + zeroPad(second, 2) + "." + zeroPad(millisecond, 3);
    return escapeString(str);
  };
  SqlString2.bufferToString = function bufferToString(buffer) {
    return "X" + escapeString(buffer.toString("hex"));
  };
  SqlString2.objectToValues = function objectToValues(object, timeZone) {
    var sql = "";
    for (var key in object) {
      var val = object[key];
      if (typeof val === "function") {
        continue;
      }
      sql += (sql.length === 0 ? "" : ", ") + SqlString2.escapeId(key) + " = " + SqlString2.escape(val, true, timeZone);
    }
    return sql;
  };
  SqlString2.raw = function raw(sql) {
    if (typeof sql !== "string") {
      throw new TypeError("argument sql must be a string");
    }
    return {
      toSqlString: function toSqlString() {
        return sql;
      }
    };
  };
  function escapeString(val) {
    var chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
    var escapedVal = "";
    var match;
    while (match = CHARS_GLOBAL_REGEXP.exec(val)) {
      escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
      chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
    }
    if (chunkIndex === 0) {
      return "'" + val + "'";
    }
    if (chunkIndex < val.length) {
      return "'" + escapedVal + val.slice(chunkIndex) + "'";
    }
    return "'" + escapedVal + "'";
  }
  function zeroPad(number, length2) {
    number = number.toString();
    while (number.length < length2) {
      number = "0" + number;
    }
    return number;
  }
  function convertTimezone(tz) {
    if (tz === "Z") {
      return 0;
    }
    var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
    if (m) {
      return (m[1] === "-" ? -1 : 1) * (parseInt(m[2], 10) + (m[3] ? parseInt(m[3], 10) : 0) / 60) * 60;
    }
    return false;
  }
})(SqlString$2);
var sqlstring = SqlString$2;
var client = {};
client.LONG_PASSWORD = 1;
client.FOUND_ROWS = 2;
client.LONG_FLAG = 4;
client.CONNECT_WITH_DB = 8;
client.NO_SCHEMA = 16;
client.COMPRESS = 32;
client.ODBC = 64;
client.LOCAL_FILES = 128;
client.IGNORE_SPACE = 256;
client.PROTOCOL_41 = 512;
client.INTERACTIVE = 1024;
client.SSL = 2048;
client.IGNORE_SIGPIPE = 4096;
client.TRANSACTIONS = 8192;
client.RESERVED = 16384;
client.SECURE_CONNECTION = 32768;
client.MULTI_STATEMENTS = 65536;
client.MULTI_RESULTS = 131072;
client.PS_MULTI_RESULTS = 262144;
client.PLUGIN_AUTH = 524288;
client.CONNECT_ATTRS = 1048576;
client.PLUGIN_AUTH_LENENC_CLIENT_DATA = 2097152;
client.CAN_HANDLE_EXPIRED_PASSWORDS = 4194304;
client.SESSION_TRACK = 8388608;
client.DEPRECATE_EOF = 16777216;
client.SSL_VERIFY_SERVER_CERT = 1073741824;
client.REMEMBER_OPTIONS = 2147483648;
client.MULTI_FACTOR_AUTHENTICATION = 268435456;
var charsets = {};
(function(exports) {
  exports.BIG5_CHINESE_CI = 1;
  exports.LATIN2_CZECH_CS = 2;
  exports.DEC8_SWEDISH_CI = 3;
  exports.CP850_GENERAL_CI = 4;
  exports.LATIN1_GERMAN1_CI = 5;
  exports.HP8_ENGLISH_CI = 6;
  exports.KOI8R_GENERAL_CI = 7;
  exports.LATIN1_SWEDISH_CI = 8;
  exports.LATIN2_GENERAL_CI = 9;
  exports.SWE7_SWEDISH_CI = 10;
  exports.ASCII_GENERAL_CI = 11;
  exports.UJIS_JAPANESE_CI = 12;
  exports.SJIS_JAPANESE_CI = 13;
  exports.CP1251_BULGARIAN_CI = 14;
  exports.LATIN1_DANISH_CI = 15;
  exports.HEBREW_GENERAL_CI = 16;
  exports.TIS620_THAI_CI = 18;
  exports.EUCKR_KOREAN_CI = 19;
  exports.LATIN7_ESTONIAN_CS = 20;
  exports.LATIN2_HUNGARIAN_CI = 21;
  exports.KOI8U_GENERAL_CI = 22;
  exports.CP1251_UKRAINIAN_CI = 23;
  exports.GB2312_CHINESE_CI = 24;
  exports.GREEK_GENERAL_CI = 25;
  exports.CP1250_GENERAL_CI = 26;
  exports.LATIN2_CROATIAN_CI = 27;
  exports.GBK_CHINESE_CI = 28;
  exports.CP1257_LITHUANIAN_CI = 29;
  exports.LATIN5_TURKISH_CI = 30;
  exports.LATIN1_GERMAN2_CI = 31;
  exports.ARMSCII8_GENERAL_CI = 32;
  exports.UTF8_GENERAL_CI = 33;
  exports.CP1250_CZECH_CS = 34;
  exports.UCS2_GENERAL_CI = 35;
  exports.CP866_GENERAL_CI = 36;
  exports.KEYBCS2_GENERAL_CI = 37;
  exports.MACCE_GENERAL_CI = 38;
  exports.MACROMAN_GENERAL_CI = 39;
  exports.CP852_GENERAL_CI = 40;
  exports.LATIN7_GENERAL_CI = 41;
  exports.LATIN7_GENERAL_CS = 42;
  exports.MACCE_BIN = 43;
  exports.CP1250_CROATIAN_CI = 44;
  exports.UTF8MB4_GENERAL_CI = 45;
  exports.UTF8MB4_BIN = 46;
  exports.LATIN1_BIN = 47;
  exports.LATIN1_GENERAL_CI = 48;
  exports.LATIN1_GENERAL_CS = 49;
  exports.CP1251_BIN = 50;
  exports.CP1251_GENERAL_CI = 51;
  exports.CP1251_GENERAL_CS = 52;
  exports.MACROMAN_BIN = 53;
  exports.UTF16_GENERAL_CI = 54;
  exports.UTF16_BIN = 55;
  exports.UTF16LE_GENERAL_CI = 56;
  exports.CP1256_GENERAL_CI = 57;
  exports.CP1257_BIN = 58;
  exports.CP1257_GENERAL_CI = 59;
  exports.UTF32_GENERAL_CI = 60;
  exports.UTF32_BIN = 61;
  exports.UTF16LE_BIN = 62;
  exports.BINARY = 63;
  exports.ARMSCII8_BIN = 64;
  exports.ASCII_BIN = 65;
  exports.CP1250_BIN = 66;
  exports.CP1256_BIN = 67;
  exports.CP866_BIN = 68;
  exports.DEC8_BIN = 69;
  exports.GREEK_BIN = 70;
  exports.HEBREW_BIN = 71;
  exports.HP8_BIN = 72;
  exports.KEYBCS2_BIN = 73;
  exports.KOI8R_BIN = 74;
  exports.KOI8U_BIN = 75;
  exports.UTF8_TOLOWER_CI = 76;
  exports.LATIN2_BIN = 77;
  exports.LATIN5_BIN = 78;
  exports.LATIN7_BIN = 79;
  exports.CP850_BIN = 80;
  exports.CP852_BIN = 81;
  exports.SWE7_BIN = 82;
  exports.UTF8_BIN = 83;
  exports.BIG5_BIN = 84;
  exports.EUCKR_BIN = 85;
  exports.GB2312_BIN = 86;
  exports.GBK_BIN = 87;
  exports.SJIS_BIN = 88;
  exports.TIS620_BIN = 89;
  exports.UCS2_BIN = 90;
  exports.UJIS_BIN = 91;
  exports.GEOSTD8_GENERAL_CI = 92;
  exports.GEOSTD8_BIN = 93;
  exports.LATIN1_SPANISH_CI = 94;
  exports.CP932_JAPANESE_CI = 95;
  exports.CP932_BIN = 96;
  exports.EUCJPMS_JAPANESE_CI = 97;
  exports.EUCJPMS_BIN = 98;
  exports.CP1250_POLISH_CI = 99;
  exports.UTF16_UNICODE_CI = 101;
  exports.UTF16_ICELANDIC_CI = 102;
  exports.UTF16_LATVIAN_CI = 103;
  exports.UTF16_ROMANIAN_CI = 104;
  exports.UTF16_SLOVENIAN_CI = 105;
  exports.UTF16_POLISH_CI = 106;
  exports.UTF16_ESTONIAN_CI = 107;
  exports.UTF16_SPANISH_CI = 108;
  exports.UTF16_SWEDISH_CI = 109;
  exports.UTF16_TURKISH_CI = 110;
  exports.UTF16_CZECH_CI = 111;
  exports.UTF16_DANISH_CI = 112;
  exports.UTF16_LITHUANIAN_CI = 113;
  exports.UTF16_SLOVAK_CI = 114;
  exports.UTF16_SPANISH2_CI = 115;
  exports.UTF16_ROMAN_CI = 116;
  exports.UTF16_PERSIAN_CI = 117;
  exports.UTF16_ESPERANTO_CI = 118;
  exports.UTF16_HUNGARIAN_CI = 119;
  exports.UTF16_SINHALA_CI = 120;
  exports.UTF16_GERMAN2_CI = 121;
  exports.UTF16_CROATIAN_CI = 122;
  exports.UTF16_UNICODE_520_CI = 123;
  exports.UTF16_VIETNAMESE_CI = 124;
  exports.UCS2_UNICODE_CI = 128;
  exports.UCS2_ICELANDIC_CI = 129;
  exports.UCS2_LATVIAN_CI = 130;
  exports.UCS2_ROMANIAN_CI = 131;
  exports.UCS2_SLOVENIAN_CI = 132;
  exports.UCS2_POLISH_CI = 133;
  exports.UCS2_ESTONIAN_CI = 134;
  exports.UCS2_SPANISH_CI = 135;
  exports.UCS2_SWEDISH_CI = 136;
  exports.UCS2_TURKISH_CI = 137;
  exports.UCS2_CZECH_CI = 138;
  exports.UCS2_DANISH_CI = 139;
  exports.UCS2_LITHUANIAN_CI = 140;
  exports.UCS2_SLOVAK_CI = 141;
  exports.UCS2_SPANISH2_CI = 142;
  exports.UCS2_ROMAN_CI = 143;
  exports.UCS2_PERSIAN_CI = 144;
  exports.UCS2_ESPERANTO_CI = 145;
  exports.UCS2_HUNGARIAN_CI = 146;
  exports.UCS2_SINHALA_CI = 147;
  exports.UCS2_GERMAN2_CI = 148;
  exports.UCS2_CROATIAN_CI = 149;
  exports.UCS2_UNICODE_520_CI = 150;
  exports.UCS2_VIETNAMESE_CI = 151;
  exports.UCS2_GENERAL_MYSQL500_CI = 159;
  exports.UTF32_UNICODE_CI = 160;
  exports.UTF32_ICELANDIC_CI = 161;
  exports.UTF32_LATVIAN_CI = 162;
  exports.UTF32_ROMANIAN_CI = 163;
  exports.UTF32_SLOVENIAN_CI = 164;
  exports.UTF32_POLISH_CI = 165;
  exports.UTF32_ESTONIAN_CI = 166;
  exports.UTF32_SPANISH_CI = 167;
  exports.UTF32_SWEDISH_CI = 168;
  exports.UTF32_TURKISH_CI = 169;
  exports.UTF32_CZECH_CI = 170;
  exports.UTF32_DANISH_CI = 171;
  exports.UTF32_LITHUANIAN_CI = 172;
  exports.UTF32_SLOVAK_CI = 173;
  exports.UTF32_SPANISH2_CI = 174;
  exports.UTF32_ROMAN_CI = 175;
  exports.UTF32_PERSIAN_CI = 176;
  exports.UTF32_ESPERANTO_CI = 177;
  exports.UTF32_HUNGARIAN_CI = 178;
  exports.UTF32_SINHALA_CI = 179;
  exports.UTF32_GERMAN2_CI = 180;
  exports.UTF32_CROATIAN_CI = 181;
  exports.UTF32_UNICODE_520_CI = 182;
  exports.UTF32_VIETNAMESE_CI = 183;
  exports.UTF8_UNICODE_CI = 192;
  exports.UTF8_ICELANDIC_CI = 193;
  exports.UTF8_LATVIAN_CI = 194;
  exports.UTF8_ROMANIAN_CI = 195;
  exports.UTF8_SLOVENIAN_CI = 196;
  exports.UTF8_POLISH_CI = 197;
  exports.UTF8_ESTONIAN_CI = 198;
  exports.UTF8_SPANISH_CI = 199;
  exports.UTF8_SWEDISH_CI = 200;
  exports.UTF8_TURKISH_CI = 201;
  exports.UTF8_CZECH_CI = 202;
  exports.UTF8_DANISH_CI = 203;
  exports.UTF8_LITHUANIAN_CI = 204;
  exports.UTF8_SLOVAK_CI = 205;
  exports.UTF8_SPANISH2_CI = 206;
  exports.UTF8_ROMAN_CI = 207;
  exports.UTF8_PERSIAN_CI = 208;
  exports.UTF8_ESPERANTO_CI = 209;
  exports.UTF8_HUNGARIAN_CI = 210;
  exports.UTF8_SINHALA_CI = 211;
  exports.UTF8_GERMAN2_CI = 212;
  exports.UTF8_CROATIAN_CI = 213;
  exports.UTF8_UNICODE_520_CI = 214;
  exports.UTF8_VIETNAMESE_CI = 215;
  exports.UTF8_GENERAL_MYSQL500_CI = 223;
  exports.UTF8MB4_UNICODE_CI = 224;
  exports.UTF8MB4_ICELANDIC_CI = 225;
  exports.UTF8MB4_LATVIAN_CI = 226;
  exports.UTF8MB4_ROMANIAN_CI = 227;
  exports.UTF8MB4_SLOVENIAN_CI = 228;
  exports.UTF8MB4_POLISH_CI = 229;
  exports.UTF8MB4_ESTONIAN_CI = 230;
  exports.UTF8MB4_SPANISH_CI = 231;
  exports.UTF8MB4_SWEDISH_CI = 232;
  exports.UTF8MB4_TURKISH_CI = 233;
  exports.UTF8MB4_CZECH_CI = 234;
  exports.UTF8MB4_DANISH_CI = 235;
  exports.UTF8MB4_LITHUANIAN_CI = 236;
  exports.UTF8MB4_SLOVAK_CI = 237;
  exports.UTF8MB4_SPANISH2_CI = 238;
  exports.UTF8MB4_ROMAN_CI = 239;
  exports.UTF8MB4_PERSIAN_CI = 240;
  exports.UTF8MB4_ESPERANTO_CI = 241;
  exports.UTF8MB4_HUNGARIAN_CI = 242;
  exports.UTF8MB4_SINHALA_CI = 243;
  exports.UTF8MB4_GERMAN2_CI = 244;
  exports.UTF8MB4_CROATIAN_CI = 245;
  exports.UTF8MB4_UNICODE_520_CI = 246;
  exports.UTF8MB4_VIETNAMESE_CI = 247;
  exports.GB18030_CHINESE_CI = 248;
  exports.GB18030_BIN = 249;
  exports.GB18030_UNICODE_520_CI = 250;
  exports.UTF8_GENERAL50_CI = 253;
  exports.UTF8MB4_0900_AI_CI = 255;
  exports.UTF8MB4_DE_PB_0900_AI_CI = 256;
  exports.UTF8MB4_IS_0900_AI_CI = 257;
  exports.UTF8MB4_LV_0900_AI_CI = 258;
  exports.UTF8MB4_RO_0900_AI_CI = 259;
  exports.UTF8MB4_SL_0900_AI_CI = 260;
  exports.UTF8MB4_PL_0900_AI_CI = 261;
  exports.UTF8MB4_ET_0900_AI_CI = 262;
  exports.UTF8MB4_ES_0900_AI_CI = 263;
  exports.UTF8MB4_SV_0900_AI_CI = 264;
  exports.UTF8MB4_TR_0900_AI_CI = 265;
  exports.UTF8MB4_CS_0900_AI_CI = 266;
  exports.UTF8MB4_DA_0900_AI_CI = 267;
  exports.UTF8MB4_LT_0900_AI_CI = 268;
  exports.UTF8MB4_SK_0900_AI_CI = 269;
  exports.UTF8MB4_ES_TRAD_0900_AI_CI = 270;
  exports.UTF8MB4_LA_0900_AI_CI = 271;
  exports.UTF8MB4_EO_0900_AI_CI = 273;
  exports.UTF8MB4_HU_0900_AI_CI = 274;
  exports.UTF8MB4_HR_0900_AI_CI = 275;
  exports.UTF8MB4_VI_0900_AI_CI = 277;
  exports.UTF8MB4_0900_AS_CS = 278;
  exports.UTF8MB4_DE_PB_0900_AS_CS = 279;
  exports.UTF8MB4_IS_0900_AS_CS = 280;
  exports.UTF8MB4_LV_0900_AS_CS = 281;
  exports.UTF8MB4_RO_0900_AS_CS = 282;
  exports.UTF8MB4_SL_0900_AS_CS = 283;
  exports.UTF8MB4_PL_0900_AS_CS = 284;
  exports.UTF8MB4_ET_0900_AS_CS = 285;
  exports.UTF8MB4_ES_0900_AS_CS = 286;
  exports.UTF8MB4_SV_0900_AS_CS = 287;
  exports.UTF8MB4_TR_0900_AS_CS = 288;
  exports.UTF8MB4_CS_0900_AS_CS = 289;
  exports.UTF8MB4_DA_0900_AS_CS = 290;
  exports.UTF8MB4_LT_0900_AS_CS = 291;
  exports.UTF8MB4_SK_0900_AS_CS = 292;
  exports.UTF8MB4_ES_TRAD_0900_AS_CS = 293;
  exports.UTF8MB4_LA_0900_AS_CS = 294;
  exports.UTF8MB4_EO_0900_AS_CS = 296;
  exports.UTF8MB4_HU_0900_AS_CS = 297;
  exports.UTF8MB4_HR_0900_AS_CS = 298;
  exports.UTF8MB4_VI_0900_AS_CS = 300;
  exports.UTF8MB4_JA_0900_AS_CS = 303;
  exports.UTF8MB4_JA_0900_AS_CS_KS = 304;
  exports.UTF8MB4_0900_AS_CI = 305;
  exports.UTF8MB4_RU_0900_AI_CI = 306;
  exports.UTF8MB4_RU_0900_AS_CS = 307;
  exports.UTF8MB4_ZH_0900_AS_CS = 308;
  exports.UTF8MB4_0900_BIN = 309;
  exports.BIG5 = exports.BIG5_CHINESE_CI;
  exports.DEC8 = exports.DEC8_SWEDISH_CI;
  exports.CP850 = exports.CP850_GENERAL_CI;
  exports.HP8 = exports.HP8_ENGLISH_CI;
  exports.KOI8R = exports.KOI8R_GENERAL_CI;
  exports.LATIN1 = exports.LATIN1_SWEDISH_CI;
  exports.LATIN2 = exports.LATIN2_GENERAL_CI;
  exports.SWE7 = exports.SWE7_SWEDISH_CI;
  exports.ASCII = exports.ASCII_GENERAL_CI;
  exports.UJIS = exports.UJIS_JAPANESE_CI;
  exports.SJIS = exports.SJIS_JAPANESE_CI;
  exports.HEBREW = exports.HEBREW_GENERAL_CI;
  exports.TIS620 = exports.TIS620_THAI_CI;
  exports.EUCKR = exports.EUCKR_KOREAN_CI;
  exports.KOI8U = exports.KOI8U_GENERAL_CI;
  exports.GB2312 = exports.GB2312_CHINESE_CI;
  exports.GREEK = exports.GREEK_GENERAL_CI;
  exports.CP1250 = exports.CP1250_GENERAL_CI;
  exports.GBK = exports.GBK_CHINESE_CI;
  exports.LATIN5 = exports.LATIN5_TURKISH_CI;
  exports.ARMSCII8 = exports.ARMSCII8_GENERAL_CI;
  exports.UTF8 = exports.UTF8_GENERAL_CI;
  exports.UCS2 = exports.UCS2_GENERAL_CI;
  exports.CP866 = exports.CP866_GENERAL_CI;
  exports.KEYBCS2 = exports.KEYBCS2_GENERAL_CI;
  exports.MACCE = exports.MACCE_GENERAL_CI;
  exports.MACROMAN = exports.MACROMAN_GENERAL_CI;
  exports.CP852 = exports.CP852_GENERAL_CI;
  exports.LATIN7 = exports.LATIN7_GENERAL_CI;
  exports.UTF8MB4 = exports.UTF8MB4_GENERAL_CI;
  exports.CP1251 = exports.CP1251_GENERAL_CI;
  exports.UTF16 = exports.UTF16_GENERAL_CI;
  exports.UTF16LE = exports.UTF16LE_GENERAL_CI;
  exports.CP1256 = exports.CP1256_GENERAL_CI;
  exports.CP1257 = exports.CP1257_GENERAL_CI;
  exports.UTF32 = exports.UTF32_GENERAL_CI;
  exports.CP932 = exports.CP932_JAPANESE_CI;
  exports.EUCJPMS = exports.EUCJPMS_JAPANESE_CI;
  exports.GB18030 = exports.GB18030_CHINESE_CI;
  exports.GEOSTD8 = exports.GEOSTD8_GENERAL_CI;
})(charsets);
const version$1 = "3.14.1";
const require$$3 = {
  version: version$1
};
var ssl_profiles = {};
var lib$2 = { exports: {} };
var defaults = {};
var hasRequiredDefaults;
function requireDefaults() {
  if (hasRequiredDefaults) return defaults;
  hasRequiredDefaults = 1;
  Object.defineProperty(defaults, "__esModule", { value: true });
  defaults.defaults = void 0;
  defaults.defaults = [
    "-----BEGIN CERTIFICATE-----\nMIIEEjCCAvqgAwIBAgIJAM2ZN/+nPi27MA0GCSqGSIb3DQEBCwUAMIGVMQswCQYD\nVQQGEwJVUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEi\nMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1h\nem9uIFJEUzEmMCQGA1UEAwwdQW1hem9uIFJEUyBhZi1zb3V0aC0xIFJvb3QgQ0Ew\nHhcNMTkxMDI4MTgwNTU4WhcNMjQxMDI2MTgwNTU4WjCBlTELMAkGA1UEBhMCVVMx\nEDAOBgNVBAcMB1NlYXR0bGUxEzARBgNVBAgMCldhc2hpbmd0b24xIjAgBgNVBAoM\nGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\nJjAkBgNVBAMMHUFtYXpvbiBSRFMgYWYtc291dGgtMSBSb290IENBMIIBIjANBgkq\nhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwR2351uPMZaJk2gMGT+1sk8HE9MQh2rc\n/sCnbxGn2p1c7Oi9aBbd/GiFijeJb2BXvHU+TOq3d3Jjqepq8tapXVt4ojbTJNyC\nJ5E7r7KjTktKdLxtBE1MK25aY+IRJjtdU6vG3KiPKUT1naO3xs3yt0F76WVuFivd\n9OHv2a+KHvPkRUWIxpmAHuMY9SIIMmEZtVE7YZGx5ah0iO4JzItHcbVR0y0PBH55\narpFBddpIVHCacp1FUPxSEWkOpI7q0AaU4xfX0fe1BV5HZYRKpBOIp1TtZWvJD+X\njGUtL1BEsT5vN5g9MkqdtYrC+3SNpAk4VtpvJrdjraI/hhvfeXNnAwIDAQABo2Mw\nYTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUEEi/\nWWMcBJsoGXg+EZwkQ0MscZQwHwYDVR0jBBgwFoAUEEi/WWMcBJsoGXg+EZwkQ0Ms\ncZQwDQYJKoZIhvcNAQELBQADggEBAGDZ5js5Pc/gC58LJrwMPXFhJDBS8QuDm23C\nFFUdlqucskwOS3907ErK1ZkmVJCIqFLArHqskFXMAkRZ2PNR7RjWLqBs+0znG5yH\nhRKb4DXzhUFQ18UBRcvT6V6zN97HTRsEEaNhM/7k8YLe7P8vfNZ28VIoJIGGgv9D\nwQBBvkxQ71oOmAG0AwaGD0ORGUfbYry9Dz4a4IcUsZyRWRMADixgrFv6VuETp26s\n/+z+iqNaGWlELBKh3iQCT6Y/1UnkPLO42bxrCSyOvshdkYN58Q2gMTE1SVTqyo8G\nLw8lLAz9bnvUSgHzB3jRrSx6ggF/WRMRYlR++y6LXP4SAsSAaC0=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEEjCCAvqgAwIBAgIJAJYM4LxvTZA6MA0GCSqGSIb3DQEBCwUAMIGVMQswCQYD\nVQQGEwJVUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEi\nMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1h\nem9uIFJEUzEmMCQGA1UEAwwdQW1hem9uIFJEUyBldS1zb3V0aC0xIFJvb3QgQ0Ew\nHhcNMTkxMDMwMjAyMDM2WhcNMjQxMDI4MjAyMDM2WjCBlTELMAkGA1UEBhMCVVMx\nEDAOBgNVBAcMB1NlYXR0bGUxEzARBgNVBAgMCldhc2hpbmd0b24xIjAgBgNVBAoM\nGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\nJjAkBgNVBAMMHUFtYXpvbiBSRFMgZXUtc291dGgtMSBSb290IENBMIIBIjANBgkq\nhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqM921jXCXeqpRNCS9CBPOe5N7gMaEt+D\ns5uR3riZbqzRlHGiF1jZihkXfHAIQewDwy+Yz+Oec1aEZCQMhUHxZJPusuX0cJfj\nb+UluFqHIijL2TfXJ3D0PVLLoNTQJZ8+GAPECyojAaNuoHbdVqxhOcznMsXIXVFq\nyVLKDGvyKkJjai/iSPDrQMXufg3kWt0ISjNLvsG5IFXgP4gttsM8i0yvRd4QcHoo\nDjvH7V3cS+CQqW5SnDrGnHToB0RLskE1ET+oNOfeN9PWOxQprMOX/zmJhnJQlTqD\nQP7jcf7SddxrKFjuziFiouskJJyNDsMjt1Lf60+oHZhed2ogTeifGwIDAQABo2Mw\nYTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUFBAF\ncgJe/BBuZiGeZ8STfpkgRYQwHwYDVR0jBBgwFoAUFBAFcgJe/BBuZiGeZ8STfpkg\nRYQwDQYJKoZIhvcNAQELBQADggEBAKAYUtlvDuX2UpZW9i1QgsjFuy/ErbW0dLHU\ne/IcFtju2z6RLZ+uF+5A8Kme7IKG1hgt8s+w9TRVQS/7ukQzoK3TaN6XKXRosjtc\no9Rm4gYWM8bmglzY1TPNaiI4HC7546hSwJhubjN0bXCuj/0sHD6w2DkiGuwKNAef\nyTu5vZhPkeNyXLykxkzz7bNp2/PtMBnzIp+WpS7uUDmWyScGPohKMq5PqvL59z+L\nZI3CYeMZrJ5VpXUg3fNNIz/83N3G0sk7wr0ohs/kHTP7xPOYB0zD7Ku4HA0Q9Swf\nWX0qr6UQgTPMjfYDLffI7aEId0gxKw1eGYc6Cq5JAZ3ipi/cBFc=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEEjCCAvqgAwIBAgIJANew34ehz5l8MA0GCSqGSIb3DQEBCwUAMIGVMQswCQYD\nVQQGEwJVUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEi\nMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1h\nem9uIFJEUzEmMCQGA1UEAwwdQW1hem9uIFJEUyBtZS1zb3V0aC0xIFJvb3QgQ0Ew\nHhcNMTkwNTEwMjE0ODI3WhcNMjQwNTA4MjE0ODI3WjCBlTELMAkGA1UEBhMCVVMx\nEDAOBgNVBAcMB1NlYXR0bGUxEzARBgNVBAgMCldhc2hpbmd0b24xIjAgBgNVBAoM\nGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMx\nJjAkBgNVBAMMHUFtYXpvbiBSRFMgbWUtc291dGgtMSBSb290IENBMIIBIjANBgkq\nhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp7BYV88MukcY+rq0r79+C8UzkT30fEfT\naPXbx1d6M7uheGN4FMaoYmL+JE1NZPaMRIPTHhFtLSdPccInvenRDIatcXX+jgOk\nUA6lnHQ98pwN0pfDUyz/Vph4jBR9LcVkBbe0zdoKKp+HGbMPRU0N2yNrog9gM5O8\ngkU/3O2csJ/OFQNnj4c2NQloGMUpEmedwJMOyQQfcUyt9CvZDfIPNnheUS29jGSw\nERpJe/AENu8Pxyc72jaXQuD+FEi2Ck6lBkSlWYQFhTottAeGvVFNCzKszCntrtqd\nrdYUwurYsLTXDHv9nW2hfDUQa0mhXf9gNDOBIVAZugR9NqNRNyYLHQIDAQABo2Mw\nYTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU54cf\nDjgwBx4ycBH8+/r8WXdaiqYwHwYDVR0jBBgwFoAU54cfDjgwBx4ycBH8+/r8WXda\niqYwDQYJKoZIhvcNAQELBQADggEBAIIMTSPx/dR7jlcxggr+O6OyY49Rlap2laKA\neC/XI4ySP3vQkIFlP822U9Kh8a9s46eR0uiwV4AGLabcu0iKYfXjPkIprVCqeXV7\nny9oDtrbflyj7NcGdZLvuzSwgl9SYTJp7PVCZtZutsPYlbJrBPHwFABvAkMvRtDB\nhitIg4AESDGPoCl94sYHpfDfjpUDMSrAMDUyO6DyBdZH5ryRMAs3lGtsmkkNUrso\naTW6R05681Z0mvkRdb+cdXtKOSuDZPoe2wJJIaz3IlNQNSrB5TImMYgmt6iAsFhv\n3vfTSTKrZDNTJn4ybG6pq1zWExoXsktZPylJly6R3RBwV6nwqBM=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBjCCAu6gAwIBAgIJAMc0ZzaSUK51MA0GCSqGSIb3DQEBCwUAMIGPMQswCQYD\nVQQGEwJVUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEi\nMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1h\nem9uIFJEUzEgMB4GA1UEAwwXQW1hem9uIFJEUyBSb290IDIwMTkgQ0EwHhcNMTkw\nODIyMTcwODUwWhcNMjQwODIyMTcwODUwWjCBjzELMAkGA1UEBhMCVVMxEDAOBgNV\nBAcMB1NlYXR0bGUxEzARBgNVBAgMCldhc2hpbmd0b24xIjAgBgNVBAoMGUFtYXpv\nbiBXZWIgU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxIDAeBgNV\nBAMMF0FtYXpvbiBSRFMgUm9vdCAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEArXnF/E6/Qh+ku3hQTSKPMhQQlCpoWvnIthzX6MK3p5a0eXKZ\noWIjYcNNG6UwJjp4fUXl6glp53Jobn+tWNX88dNH2n8DVbppSwScVE2LpuL+94vY\n0EYE/XxN7svKea8YvlrqkUBKyxLxTjh+U/KrGOaHxz9v0l6ZNlDbuaZw3qIWdD/I\n6aNbGeRUVtpM6P+bWIoxVl/caQylQS6CEYUk+CpVyJSkopwJlzXT07tMoDL5WgX9\nO08KVgDNz9qP/IGtAcRduRcNioH3E9v981QO1zt/Gpb2f8NqAjUUCUZzOnij6mx9\nMcZ+9cWX88CRzR0vQODWuZscgI08NvM69Fn2SQIDAQABo2MwYTAOBgNVHQ8BAf8E\nBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUc19g2LzLA5j0Kxc0LjZa\npmD/vB8wHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJKoZIhvcN\nAQELBQADggEBAHAG7WTmyjzPRIM85rVj+fWHsLIvqpw6DObIjMWokpliCeMINZFV\nynfgBKsf1ExwbvJNzYFXW6dihnguDG9VMPpi2up/ctQTN8tm9nDKOy08uNZoofMc\nNUZxKCEkVKZv+IL4oHoeayt8egtv3ujJM6V14AstMQ6SwvwvA93EP/Ug2e4WAXHu\ncbI1NAbUgVDqp+DRdfvZkgYKryjTWd/0+1fS8X1bBZVWzl7eirNVnHbSH2ZDpNuY\n0SBd8dj5F6ld3t58ydZbrTHze7JJOd8ijySAp4/kiu9UfZWuTPABzDa/DSdz9Dk/\nzPW4CXXvhLmE02TA9/HeCw3KEHIwicNuEfw=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEEDCCAvigAwIBAgIJAKFMXyltvuRdMA0GCSqGSIb3DQEBCwUAMIGUMQswCQYD\nVQQGEwJVUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEi\nMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1h\nem9uIFJEUzElMCMGA1UEAwwcQW1hem9uIFJEUyBCZXRhIFJvb3QgMjAxOSBDQTAe\nFw0xOTA4MTkxNzM4MjZaFw0yNDA4MTkxNzM4MjZaMIGUMQswCQYDVQQGEwJVUzEQ\nMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEiMCAGA1UECgwZ\nQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEl\nMCMGA1UEAwwcQW1hem9uIFJEUyBCZXRhIFJvb3QgMjAxOSBDQTCCASIwDQYJKoZI\nhvcNAQEBBQADggEPADCCAQoCggEBAMkZdnIH9ndatGAcFo+DppGJ1HUt4x+zeO+0\nZZ29m0sfGetVulmTlv2d5b66e+QXZFWpcPQMouSxxYTW08TbrQiZngKr40JNXftA\natvzBqIImD4II0ZX5UEVj2h98qe/ypW5xaDN7fEa5e8FkYB1TEemPaWIbNXqchcL\ntV7IJPr3Cd7Z5gZJlmujIVDPpMuSiNaal9/6nT9oqN+JSM1fx5SzrU5ssg1Vp1vv\n5Xab64uOg7wCJRB9R2GC9XD04odX6VcxUAGrZo6LR64ZSifupo3l+R5sVOc5i8NH\nskdboTzU9H7+oSdqoAyhIU717PcqeDum23DYlPE2nGBWckE+eT8CAwEAAaNjMGEw\nDgYDVR0PAQH/BAQDAgEGMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFK2hDBWl\nsbHzt/EHd0QYOooqcFPhMB8GA1UdIwQYMBaAFK2hDBWlsbHzt/EHd0QYOooqcFPh\nMA0GCSqGSIb3DQEBCwUAA4IBAQAO/718k8EnOqJDx6wweUscGTGL/QdKXUzTVRAx\nJUsjNUv49mH2HQVEW7oxszfH6cPCaupNAddMhQc4C/af6GHX8HnqfPDk27/yBQI+\nyBBvIanGgxv9c9wBbmcIaCEWJcsLp3HzXSYHmjiqkViXwCpYfkoV3Ns2m8bp+KCO\ny9XmcCKRaXkt237qmoxoh2sGmBHk2UlQtOsMC0aUQ4d7teAJG0q6pbyZEiPyKZY1\nXR/UVxMJL0Q4iVpcRS1kaNCMfqS2smbLJeNdsan8pkw1dvPhcaVTb7CvjhJtjztF\nYfDzAI5794qMlWxwilKMmUvDlPPOTen8NNHkLwWvyFCH7Doh\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEFjCCAv6gAwIBAgIJAMzYZJ+R9NBVMA0GCSqGSIb3DQEBCwUAMIGXMQswCQYD\nVQQGEwJVUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEi\nMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1h\nem9uIFJEUzEoMCYGA1UEAwwfQW1hem9uIFJEUyBQcmV2aWV3IFJvb3QgMjAxOSBD\nQTAeFw0xOTA4MjEyMjI5NDlaFw0yNDA4MjEyMjI5NDlaMIGXMQswCQYDVQQGEwJV\nUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEiMCAGA1UE\nCgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJE\nUzEoMCYGA1UEAwwfQW1hem9uIFJEUyBQcmV2aWV3IFJvb3QgMjAxOSBDQTCCASIw\nDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM7kkS6vjgKKQTPynC2NjdN5aPPV\nO71G0JJS/2ARVBVJd93JLiGovVJilfWYfwZCs4gTRSSjrUD4D4HyqCd6A+eEEtJq\nM0DEC7i0dC+9WNTsPszuB206Jy2IUmxZMIKJAA1NHSbIMjB+b6/JhbSUi7nKdbR/\nbrj83bF+RoSA+ogrgX7mQbxhmFcoZN9OGaJgYKsKWUt5Wqv627KkGodUK8mDepgD\nS3ZfoRQRx3iceETpcmHJvaIge6+vyDX3d9Z22jmvQ4AKv3py2CmU2UwuhOltFDwB\n0ddtb39vgwrJxaGfiMRHpEP1DfNLWHAnA69/pgZPwIggidS+iBPUhgucMp8CAwEA\nAaNjMGEwDgYDVR0PAQH/BAQDAgEGMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYE\nFGnTGpQuQ2H/DZlXMQijZEhjs7TdMB8GA1UdIwQYMBaAFGnTGpQuQ2H/DZlXMQij\nZEhjs7TdMA0GCSqGSIb3DQEBCwUAA4IBAQC3xz1vQvcXAfpcZlngiRWeqU8zQAMQ\nLZPCFNv7PVk4pmqX+ZiIRo4f9Zy7TrOVcboCnqmP/b/mNq0gVF4O+88jwXJZD+f8\n/RnABMZcnGU+vK0YmxsAtYU6TIb1uhRFmbF8K80HHbj9vSjBGIQdPCbvmR2zY6VJ\nBYM+w9U9hp6H4DVMLKXPc1bFlKA5OBTgUtgkDibWJKFOEPW3UOYwp9uq6pFoN0AO\nxMTldqWFsOF3bJIlvOY0c/1EFZXu3Ns6/oCP//Ap9vumldYMUZWmbK+gK33FPOXV\n8BQ6jNC29icv7lLDpRPwjibJBXX+peDR5UK4FdYcswWEB1Tix5X8dYu6\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgZUxCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSYwJAYDVQQDDB1BbWF6b24gUkRTIGFmLXNvdXRoLTEgUm9vdCBDQTAeFw0xOTEw\nMjgxODA2NTNaFw0yNDEwMjgxODA2NTNaMIGQMQswCQYDVQQGEwJVUzETMBEGA1UE\nCAwKV2FzaGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9u\nIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEhMB8GA1UE\nAwwYQW1hem9uIFJEUyBhZi1zb3V0aC0xIENBMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEAvtV1OqmFa8zCVQSKOvPUJERLVFtd4rZmDpImc5rIoeBk7w/P\n9lcKUJjO8R/w1a2lJXx3oQ81tiY0Piw6TpT62YWVRMWrOw8+Vxq1dNaDSFp9I8d0\nUHillSSbOk6FOrPDp+R6AwbGFqUDebbN5LFFoDKbhNmH1BVS0a6YNKpGigLRqhka\ncClPslWtPqtjbaP3Jbxl26zWzLo7OtZl98dR225pq8aApNBwmtgA7Gh60HK/cX0t\n32W94n8D+GKSg6R4MKredVFqRTi9hCCNUu0sxYPoELuM+mHiqB5NPjtm92EzCWs+\n+vgWhMc6GxG+82QSWx1Vj8sgLqtE/vLrWddf5QIDAQABo2YwZDAOBgNVHQ8BAf8E\nBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUuLB4gYVJrSKJj/Gz\npqc6yeA+RcAwHwYDVR0jBBgwFoAUEEi/WWMcBJsoGXg+EZwkQ0MscZQwDQYJKoZI\nhvcNAQELBQADggEBABauYOZxUhe9/RhzGJ8MsWCz8eKcyDVd4FCnY6Qh+9wcmYNT\nLtnD88LACtJKb/b81qYzcB0Em6+zVJ3Z9jznfr6buItE6es9wAoja22Xgv44BTHL\nrimbgMwpTt3uEMXDffaS0Ww6YWb3pSE0XYI2ISMWz+xRERRf+QqktSaL39zuiaW5\ntfZMre+YhohRa/F0ZQl3RCd6yFcLx4UoSPqQsUl97WhYzwAxZZfwvLJXOc4ATt3u\nVlCUylNDkaZztDJc/yN5XQoK9W5nOt2cLu513MGYKbuarQr8f+gYU8S+qOyuSRSP\nNRITzwCRVnsJE+2JmcRInn/NcanB7uOGqTvJ9+c=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgZUxCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSYwJAYDVQQDDB1BbWF6b24gUkRTIGV1LXNvdXRoLTEgUm9vdCBDQTAeFw0xOTEw\nMzAyMDIxMzBaFw0yNDEwMzAyMDIxMzBaMIGQMQswCQYDVQQGEwJVUzETMBEGA1UE\nCAwKV2FzaGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9u\nIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEhMB8GA1UE\nAwwYQW1hem9uIFJEUyBldS1zb3V0aC0xIENBMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEAtEyjYcajx6xImJn8Vz1zjdmL4ANPgQXwF7+tF7xccmNAZETb\nbzb3I9i5fZlmrRaVznX+9biXVaGxYzIUIR3huQ3Q283KsDYnVuGa3mk690vhvJbB\nQIPgKa5mVwJppnuJm78KqaSpi0vxyCPe3h8h6LLFawVyWrYNZ4okli1/U582eef8\nRzJp/Ear3KgHOLIiCdPDF0rjOdCG1MOlDLixVnPn9IYOciqO+VivXBg+jtfc5J+L\nAaPm0/Yx4uELt1tkbWkm4BvTU/gBOODnYziITZM0l6Fgwvbwgq5duAtKW+h031lC\n37rEvrclqcp4wrsUYcLAWX79ZyKIlRxcAdvEhQIDAQABo2YwZDAOBgNVHQ8BAf8E\nBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQU7zPyc0azQxnBCe7D\nb9KAadH1QSEwHwYDVR0jBBgwFoAUFBAFcgJe/BBuZiGeZ8STfpkgRYQwDQYJKoZI\nhvcNAQELBQADggEBAFGaNiYxg7yC/xauXPlaqLCtwbm2dKyK9nIFbF/7be8mk7Q3\nMOA0of1vGHPLVQLr6bJJpD9MAbUcm4cPAwWaxwcNpxOjYOFDaq10PCK4eRAxZWwF\nNJRIRmGsl8NEsMNTMCy8X+Kyw5EzH4vWFl5Uf2bGKOeFg0zt43jWQVOX6C+aL3Cd\npRS5MhmYpxMG8irrNOxf4NVFE2zpJOCm3bn0STLhkDcV/ww4zMzObTJhiIb5wSWn\nEXKKWhUXuRt7A2y1KJtXpTbSRHQxE++69Go1tWhXtRiULCJtf7wF2Ksm0RR/AdXT\n1uR1vKyH5KBJPX3ppYkQDukoHTFR0CpB+G84NLo=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgZUxCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSYwJAYDVQQDDB1BbWF6b24gUkRTIG1lLXNvdXRoLTEgUm9vdCBDQTAeFw0xOTA1\nMTAyMTU4NDNaFw0yNTA2MDExMjAwMDBaMIGQMQswCQYDVQQGEwJVUzETMBEGA1UE\nCAwKV2FzaGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9u\nIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEhMB8GA1UE\nAwwYQW1hem9uIFJEUyBtZS1zb3V0aC0xIENBMIIBIjANBgkqhkiG9w0BAQEFAAOC\nAQ8AMIIBCgKCAQEAudOYPZH+ihJAo6hNYMB5izPVBe3TYhnZm8+X3IoaaYiKtsp1\nJJhkTT0CEejYIQ58Fh4QrMUyWvU8qsdK3diNyQRoYLbctsBPgxBR1u07eUJDv38/\nC1JlqgHmMnMi4y68Iy7ymv50QgAMuaBqgEBRI1R6Lfbyrb2YvH5txjJyTVMwuCfd\nYPAtZVouRz0JxmnfsHyxjE+So56uOKTDuw++Ho4HhZ7Qveej7XB8b+PIPuroknd3\nFQB5RVbXRvt5ZcVD4F2fbEdBniF7FAF4dEiofVCQGQ2nynT7dZdEIPfPdH3n7ZmE\nlAOmwHQ6G83OsiHRBLnbp+QZRgOsjkHJxT20bQIDAQABo2YwZDAOBgNVHQ8BAf8E\nBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUOEVDM7VomRH4HVdA\nQvIMNq2tXOcwHwYDVR0jBBgwFoAU54cfDjgwBx4ycBH8+/r8WXdaiqYwDQYJKoZI\nhvcNAQELBQADggEBAHhvMssj+Th8IpNePU6RH0BiL6o9c437R3Q4IEJeFdYL+nZz\nPW/rELDPvLRUNMfKM+KzduLZ+l29HahxefejYPXtvXBlq/E/9czFDD4fWXg+zVou\nuDXhyrV4kNmP4S0eqsAP/jQHPOZAMFA4yVwO9hlqmePhyDnszCh9c1PfJSBh49+b\n4w7i/L3VBOMt8j3EKYvqz0gVfpeqhJwL4Hey8UbVfJRFJMJzfNHpePqtDRAY7yjV\nPYquRaV2ab/E+/7VFkWMM4tazYz/qsYA2jSH+4xDHvYk8LnsbcrF9iuidQmEc5sb\nFgcWaSKG4DJjcI5k7AJLWcXyTDt21Ci43LE+I9Q=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECDCCAvCgAwIBAgICVIYwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MDQxNzEz\nMDRaFw0yNDA4MjIxNzA4NTBaMIGVMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEmMCQGA1UEAwwdQW1h\nem9uIFJEUyBhcC1zb3V0aC0xIDIwMTkgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IB\nDwAwggEKAoIBAQDUYOz1hGL42yUCrcsMSOoU8AeD/3KgZ4q7gP+vAz1WnY9K/kim\neWN/2Qqzlo3+mxSFQFyD4MyV3+CnCPnBl9Sh1G/F6kThNiJ7dEWSWBQGAB6HMDbC\nBaAsmUc1UIz8sLTL3fO+S9wYhA63Wun0Fbm/Rn2yk/4WnJAaMZcEtYf6e0KNa0LM\np/kN/70/8cD3iz3dDR8zOZFpHoCtf0ek80QqTich0A9n3JLxR6g6tpwoYviVg89e\nqCjQ4axxOkWWeusLeTJCcY6CkVyFvDAKvcUl1ytM5AiaUkXblE7zDFXRM4qMMRdt\nlPm8d3pFxh0fRYk8bIKnpmtOpz3RIctDrZZxAgMBAAGjZjBkMA4GA1UdDwEB/wQE\nAwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBT99wKJftD3jb4sHoHG\ni3uGlH6W6TAfBgNVHSMEGDAWgBRzX2DYvMsDmPQrFzQuNlqmYP+8HzANBgkqhkiG\n9w0BAQsFAAOCAQEAZ17hhr3dII3hUfuHQ1hPWGrpJOX/G9dLzkprEIcCidkmRYl+\nhu1Pe3caRMh/17+qsoEErmnVq5jNY9X1GZL04IZH8YbHc7iRHw3HcWAdhN8633+K\njYEB2LbJ3vluCGnCejq9djDb6alOugdLMJzxOkHDhMZ6/gYbECOot+ph1tQuZXzD\ntZ7prRsrcuPBChHlPjmGy8M9z8u+kF196iNSUGC4lM8vLkHM7ycc1/ZOwRq9aaTe\niOghbQQyAEe03MWCyDGtSmDfr0qEk+CHN+6hPiaL8qKt4s+V9P7DeK4iW08ny8Ox\nAVS7u0OK/5+jKMAMrKwpYrBydOjTUTHScocyNw==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBzCCAu+gAwIBAgICQ2QwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MDUxODQ2\nMjlaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\nem9uIFJEUyBzYS1lYXN0LTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAMMvR+ReRnOzqJzoaPipNTt1Z2VA968jlN1+SYKUrYM3No+Vpz0H\nM6Tn0oYB66ByVsXiGc28ulsqX1HbHsxqDPwvQTKvO7SrmDokoAkjJgLocOLUAeld\n5AwvUjxGRP6yY90NV7X786MpnYb2Il9DIIaV9HjCmPt+rjy2CZjS0UjPjCKNfB8J\nbFjgW6GGscjeyGb/zFwcom5p4j0rLydbNaOr9wOyQrtt3ZQWLYGY9Zees/b8pmcc\nJt+7jstZ2UMV32OO/kIsJ4rMUn2r/uxccPwAc1IDeRSSxOrnFKhW3Cu69iB3bHp7\nJbawY12g7zshE4I14sHjv3QoXASoXjx4xgMCAwEAAaNmMGQwDgYDVR0PAQH/BAQD\nAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFI1Fc/Ql2jx+oJPgBVYq\nccgP0pQ8MB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\nDQEBCwUAA4IBAQB4VVVabVp70myuYuZ3vltQIWqSUMhkaTzehMgGcHjMf9iLoZ/I\n93KiFUSGnek5cRePyS9wcpp0fcBT3FvkjpUdCjVtdttJgZFhBxgTd8y26ImdDDMR\n4+BUuhI5msvjL08f+Vkkpu1GQcGmyFVPFOy/UY8iefu+QyUuiBUnUuEDd49Hw0Fn\n/kIPII6Vj82a2mWV/Q8e+rgN8dIRksRjKI03DEoP8lhPlsOkhdwU6Uz9Vu6NOB2Q\nLs1kbcxAc7cFSyRVJEhh12Sz9d0q/CQSTFsVJKOjSNQBQfVnLz1GwO/IieUEAr4C\njkTntH0r1LX5b/GwN4R887LvjAEdTbg1his7\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECDCCAvCgAwIBAgIDAIkHMA0GCSqGSIb3DQEBCwUAMIGPMQswCQYDVQQGEwJV\nUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEiMCAGA1UE\nCgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJE\nUzEgMB4GA1UEAwwXQW1hem9uIFJEUyBSb290IDIwMTkgQ0EwHhcNMTkwOTA2MTc0\nMDIxWhcNMjQwODIyMTcwODUwWjCBlDELMAkGA1UEBhMCVVMxEzARBgNVBAgMCldh\nc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoMGUFtYXpvbiBXZWIg\nU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxJTAjBgNVBAMMHEFt\nYXpvbiBSRFMgdXMtd2VzdC0xIDIwMTkgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IB\nDwAwggEKAoIBAQDD2yzbbAl77OofTghDMEf624OvU0eS9O+lsdO0QlbfUfWa1Kd6\n0WkgjkLZGfSRxEHMCnrv4UPBSK/Qwn6FTjkDLgemhqBtAnplN4VsoDL+BkRX4Wwq\n/dSQJE2b+0hm9w9UMVGFDEq1TMotGGTD2B71eh9HEKzKhGzqiNeGsiX4VV+LJzdH\nuM23eGisNqmd4iJV0zcAZ+Gbh2zK6fqTOCvXtm7Idccv8vZZnyk1FiWl3NR4WAgK\nAkvWTIoFU3Mt7dIXKKClVmvssG8WHCkd3Xcb4FHy/G756UZcq67gMMTX/9fOFM/v\nl5C0+CHl33Yig1vIDZd+fXV1KZD84dEJfEvHAgMBAAGjZjBkMA4GA1UdDwEB/wQE\nAwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBR+ap20kO/6A7pPxo3+\nT3CfqZpQWjAfBgNVHSMEGDAWgBRzX2DYvMsDmPQrFzQuNlqmYP+8HzANBgkqhkiG\n9w0BAQsFAAOCAQEAHCJky2tPjPttlDM/RIqExupBkNrnSYnOK4kr9xJ3sl8UF2DA\nPAnYsjXp3rfcjN/k/FVOhxwzi3cXJF/2Tjj39Bm/OEfYTOJDNYtBwB0VVH4ffa/6\ntZl87jaIkrxJcreeeHqYMnIxeN0b/kliyA+a5L2Yb0VPjt9INq34QDc1v74FNZ17\n4z8nr1nzg4xsOWu0Dbjo966lm4nOYIGBRGOKEkHZRZ4mEiMgr3YLkv8gSmeitx57\nZ6dVemNtUic/LVo5Iqw4n3TBS0iF2C1Q1xT/s3h+0SXZlfOWttzSluDvoMv5PvCd\npFjNn+aXLAALoihL1MJSsxydtsLjOBro5eK0Vw==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEDDCCAvSgAwIBAgICOFAwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTAxNzQ2\nMjFaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\nem9uIFJEUyBhcC1ub3J0aGVhc3QtMiAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\nAAOCAQ8AMIIBCgKCAQEAzU72e6XbaJbi4HjJoRNjKxzUEuChKQIt7k3CWzNnmjc5\n8I1MjCpa2W1iw1BYVysXSNSsLOtUsfvBZxi/1uyMn5ZCaf9aeoA9UsSkFSZBjOCN\nDpKPCmfV1zcEOvJz26+1m8WDg+8Oa60QV0ou2AU1tYcw98fOQjcAES0JXXB80P2s\n3UfkNcnDz+l4k7j4SllhFPhH6BQ4lD2NiFAP4HwoG6FeJUn45EPjzrydxjq6v5Fc\ncQ8rGuHADVXotDbEhaYhNjIrsPL+puhjWfhJjheEw8c4whRZNp6gJ/b6WEes/ZhZ\nh32DwsDsZw0BfRDUMgUn8TdecNexHUw8vQWeC181hwIDAQABo2YwZDAOBgNVHQ8B\nAf8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUwW9bWgkWkr0U\nlrOsq2kvIdrECDgwHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\nKoZIhvcNAQELBQADggEBAEugF0Gj7HVhX0ehPZoGRYRt3PBuI2YjfrrJRTZ9X5wc\n9T8oHmw07mHmNy1qqWvooNJg09bDGfB0k5goC2emDiIiGfc/kvMLI7u+eQOoMKj6\nmkfCncyRN3ty08Po45vTLBFZGUvtQmjM6yKewc4sXiASSBmQUpsMbiHRCL72M5qV\nobcJOjGcIdDTmV1BHdWT+XcjynsGjUqOvQWWhhLPrn4jWe6Xuxll75qlrpn3IrIx\nCRBv/5r7qbcQJPOgwQsyK4kv9Ly8g7YT1/vYBlR3cRsYQjccw5ceWUj2DrMVWhJ4\nprf+E3Aa4vYmLLOUUvKnDQ1k3RGNu56V0tonsQbfsaM=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECjCCAvKgAwIBAgICEzUwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTAyMDUy\nMjVaFw0yNDA4MjIxNzA4NTBaMIGXMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEoMCYGA1UEAwwfQW1h\nem9uIFJEUyBjYS1jZW50cmFsLTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQAD\nggEPADCCAQoCggEBAOxHqdcPSA2uBjsCP4DLSlqSoPuQ/X1kkJLusVRKiQE2zayB\nviuCBt4VB9Qsh2rW3iYGM+usDjltGnI1iUWA5KHcvHszSMkWAOYWLiMNKTlg6LCp\nXnE89tvj5dIH6U8WlDvXLdjB/h30gW9JEX7S8supsBSci2GxEzb5mRdKaDuuF/0O\nqvz4YE04pua3iZ9QwmMFuTAOYzD1M72aOpj+7Ac+YLMM61qOtU+AU6MndnQkKoQi\nqmUN2A9IFaqHFzRlSdXwKCKUA4otzmz+/N3vFwjb5F4DSsbsrMfjeHMo6o/nb6Nh\nYDb0VJxxPee6TxSuN7CQJ2FxMlFUezcoXqwqXD0CAwEAAaNmMGQwDgYDVR0PAQH/\nBAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFDGGpon9WfIpsggE\nCxHq8hZ7E2ESMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqG\nSIb3DQEBCwUAA4IBAQAvpeQYEGZvoTVLgV9rd2+StPYykMsmFjWQcyn3dBTZRXC2\nlKq7QhQczMAOhEaaN29ZprjQzsA2X/UauKzLR2Uyqc2qOeO9/YOl0H3qauo8C/W9\nr8xqPbOCDLEXlOQ19fidXyyEPHEq5WFp8j+fTh+s8WOx2M7IuC0ANEetIZURYhSp\nxl9XOPRCJxOhj7JdelhpweX0BJDNHeUFi0ClnFOws8oKQ7sQEv66d5ddxqqZ3NVv\nRbCvCtEutQMOUMIuaygDlMn1anSM8N7Wndx8G6+Uy67AnhjGx7jw/0YPPxopEj6x\nJXP8j0sJbcT9K/9/fPVLNT25RvQ/93T2+IQL4Ca2\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBzCCAu+gAwIBAgICYpgwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTExNzMx\nNDhaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\nem9uIFJEUyBldS13ZXN0LTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAMk3YdSZ64iAYp6MyyKtYJtNzv7zFSnnNf6vv0FB4VnfITTMmOyZ\nLXqKAT2ahZ00hXi34ewqJElgU6eUZT/QlzdIu359TEZyLVPwURflL6SWgdG01Q5X\nO++7fSGcBRyIeuQWs9FJNIIqK8daF6qw0Rl5TXfu7P9dBc3zkgDXZm2DHmxGDD69\n7liQUiXzoE1q2Z9cA8+jirDioJxN9av8hQt12pskLQumhlArsMIhjhHRgF03HOh5\ntvi+RCfihVOxELyIRTRpTNiIwAqfZxxTWFTgfn+gijTmd0/1DseAe82aYic8JbuS\nEMbrDduAWsqrnJ4GPzxHKLXX0JasCUcWyMECAwEAAaNmMGQwDgYDVR0PAQH/BAQD\nAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFPLtsq1NrwJXO13C9eHt\nsLY11AGwMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\nDQEBCwUAA4IBAQAnWBKj5xV1A1mYd0kIgDdkjCwQkiKF5bjIbGkT3YEFFbXoJlSP\n0lZZ/hDaOHI8wbLT44SzOvPEEmWF9EE7SJzkvSdQrUAWR9FwDLaU427ALI3ngNHy\nlGJ2hse1fvSRNbmg8Sc9GBv8oqNIBPVuw+AJzHTacZ1OkyLZrz1c1QvwvwN2a+Jd\nvH0V0YIhv66llKcYDMUQJAQi4+8nbRxXWv6Gq3pvrFoorzsnkr42V3JpbhnYiK+9\nnRKd4uWl62KRZjGkfMbmsqZpj2fdSWMY1UGyN1k+kDmCSWYdrTRDP0xjtIocwg+A\nJ116n4hV/5mbA0BaPiS2krtv17YAeHABZcvz\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECjCCAvKgAwIBAgICV2YwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTExOTM2\nMjBaFw0yNDA4MjIxNzA4NTBaMIGXMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEoMCYGA1UEAwwfQW1h\nem9uIFJEUyBldS1jZW50cmFsLTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQAD\nggEPADCCAQoCggEBAMEx54X2pHVv86APA0RWqxxRNmdkhAyp2R1cFWumKQRofoFv\nn+SPXdkpIINpMuEIGJANozdiEz7SPsrAf8WHyD93j/ZxrdQftRcIGH41xasetKGl\nI67uans8d+pgJgBKGb/Z+B5m+UsIuEVekpvgpwKtmmaLFC/NCGuSsJoFsRqoa6Gh\nm34W6yJoY87UatddCqLY4IIXaBFsgK9Q/wYzYLbnWM6ZZvhJ52VMtdhcdzeTHNW0\n5LGuXJOF7Ahb4JkEhoo6TS2c0NxB4l4MBfBPgti+O7WjR3FfZHpt18A6Zkq6A2u6\nD/oTSL6c9/3sAaFTFgMyL3wHb2YlW0BPiljZIqECAwEAAaNmMGQwDgYDVR0PAQH/\nBAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFOcAToAc6skWffJa\nTnreaswAfrbcMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqG\nSIb3DQEBCwUAA4IBAQA1d0Whc1QtspK496mFWfFEQNegLh0a9GWYlJm+Htcj5Nxt\nDAIGXb+8xrtOZFHmYP7VLCT5Zd2C+XytqseK/+s07iAr0/EPF+O2qcyQWMN5KhgE\ncXw2SwuP9FPV3i+YAm11PBVeenrmzuk9NrdHQ7TxU4v7VGhcsd2C++0EisrmquWH\nmgIfmVDGxphwoES52cY6t3fbnXmTkvENvR+h3rj+fUiSz0aSo+XZUGHPgvuEKM/W\nCBD9Smc9CBoBgvy7BgHRgRUmwtABZHFUIEjHI5rIr7ZvYn+6A0O6sogRfvVYtWFc\nqpyrW1YX8mD0VlJ8fGKM3G+aCOsiiPKDV/Uafrm+\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECDCCAvCgAwIBAgICGAcwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTIxODE5\nNDRaFw0yNDA4MjIxNzA4NTBaMIGVMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEmMCQGA1UEAwwdQW1h\nem9uIFJEUyBldS1ub3J0aC0xIDIwMTkgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IB\nDwAwggEKAoIBAQCiIYnhe4UNBbdBb/nQxl5giM0XoVHWNrYV5nB0YukA98+TPn9v\nAoj1RGYmtryjhrf01Kuv8SWO+Eom95L3zquoTFcE2gmxCfk7bp6qJJ3eHOJB+QUO\nXsNRh76fwDzEF1yTeZWH49oeL2xO13EAx4PbZuZpZBttBM5zAxgZkqu4uWQczFEs\nJXfla7z2fvWmGcTagX10O5C18XaFroV0ubvSyIi75ue9ykg/nlFAeB7O0Wxae88e\nuhiBEFAuLYdqWnsg3459NfV8Yi1GnaitTym6VI3tHKIFiUvkSiy0DAlAGV2iiyJE\nq+DsVEO4/hSINJEtII4TMtysOsYPpINqeEzRAgMBAAGjZjBkMA4GA1UdDwEB/wQE\nAwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBRR0UpnbQyjnHChgmOc\nhnlc0PogzTAfBgNVHSMEGDAWgBRzX2DYvMsDmPQrFzQuNlqmYP+8HzANBgkqhkiG\n9w0BAQsFAAOCAQEAKJD4xVzSf4zSGTBJrmamo86jl1NHQxXUApAZuBZEc8tqC6TI\nT5CeoSr9CMuVC8grYyBjXblC4OsM5NMvmsrXl/u5C9dEwtBFjo8mm53rOOIm1fxl\nI1oYB/9mtO9ANWjkykuLzWeBlqDT/i7ckaKwalhLODsRDO73vRhYNjsIUGloNsKe\npxw3dzHwAZx4upSdEVG4RGCZ1D0LJ4Gw40OfD69hfkDfRVVxKGrbEzqxXRvovmDc\ntKLdYZO/6REoca36v4BlgIs1CbUXJGLSXUwtg7YXGLSVBJ/U0+22iGJmBSNcoyUN\ncjPFD9JQEhDDIYYKSGzIYpvslvGc4T5ISXFiuQ==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBzCCAu+gAwIBAgICZIEwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTIyMTMy\nMzJaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\nem9uIFJEUyBldS13ZXN0LTIgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBALGiwqjiF7xIjT0Sx7zB3764K2T2a1DHnAxEOr+/EIftWKxWzT3u\nPFwS2eEZcnKqSdRQ+vRzonLBeNLO4z8aLjQnNbkizZMBuXGm4BqRm1Kgq3nlLDQn\n7YqdijOq54SpShvR/8zsO4sgMDMmHIYAJJOJqBdaus2smRt0NobIKc0liy7759KB\n6kmQ47Gg+kfIwxrQA5zlvPLeQImxSoPi9LdbRoKvu7Iot7SOa+jGhVBh3VdqndJX\n7tm/saj4NE375csmMETFLAOXjat7zViMRwVorX4V6AzEg1vkzxXpA9N7qywWIT5Y\nfYaq5M8i6vvLg0CzrH9fHORtnkdjdu1y+0MCAwEAAaNmMGQwDgYDVR0PAQH/BAQD\nAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFFOhOx1yt3Z7mvGB9jBv\n2ymdZwiOMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\nDQEBCwUAA4IBAQBehqY36UGDvPVU9+vtaYGr38dBbp+LzkjZzHwKT1XJSSUc2wqM\nhnCIQKilonrTIvP1vmkQi8qHPvDRtBZKqvz/AErW/ZwQdZzqYNFd+BmOXaeZWV0Q\noHtDzXmcwtP8aUQpxN0e1xkWb1E80qoy+0uuRqb/50b/R4Q5qqSfJhkn6z8nwB10\n7RjLtJPrK8igxdpr3tGUzfAOyiPrIDncY7UJaL84GFp7WWAkH0WG3H8Y8DRcRXOU\nmqDxDLUP3rNuow3jnGxiUY+gGX5OqaZg4f4P6QzOSmeQYs6nLpH0PiN00+oS1BbD\nbpWdZEttILPI+vAYkU4QuBKKDjJL6HbSd+cn\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECDCCAvCgAwIBAgIDAIVCMA0GCSqGSIb3DQEBCwUAMIGPMQswCQYDVQQGEwJV\nUzEQMA4GA1UEBwwHU2VhdHRsZTETMBEGA1UECAwKV2FzaGluZ3RvbjEiMCAGA1UE\nCgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJE\nUzEgMB4GA1UEAwwXQW1hem9uIFJEUyBSb290IDIwMTkgQ0EwHhcNMTkwOTEzMTcw\nNjQxWhcNMjQwODIyMTcwODUwWjCBlDELMAkGA1UEBhMCVVMxEzARBgNVBAgMCldh\nc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxIjAgBgNVBAoMGUFtYXpvbiBXZWIg\nU2VydmljZXMsIEluYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxJTAjBgNVBAMMHEFt\nYXpvbiBSRFMgdXMtZWFzdC0yIDIwMTkgQ0EwggEiMA0GCSqGSIb3DQEBAQUAA4IB\nDwAwggEKAoIBAQDE+T2xYjUbxOp+pv+gRA3FO24+1zCWgXTDF1DHrh1lsPg5k7ht\n2KPYzNc+Vg4E+jgPiW0BQnA6jStX5EqVh8BU60zELlxMNvpg4KumniMCZ3krtMUC\nau1NF9rM7HBh+O+DYMBLK5eSIVt6lZosOb7bCi3V6wMLA8YqWSWqabkxwN4w0vXI\n8lu5uXXFRemHnlNf+yA/4YtN4uaAyd0ami9+klwdkZfkrDOaiy59haOeBGL8EB/c\ndbJJlguHH5CpCscs3RKtOOjEonXnKXldxarFdkMzi+aIIjQ8GyUOSAXHtQHb3gZ4\nnS6Ey0CMlwkB8vUObZU9fnjKJcL5QCQqOfwvAgMBAAGjZjBkMA4GA1UdDwEB/wQE\nAwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBQUPuRHohPxx4VjykmH\n6usGrLL1ETAfBgNVHSMEGDAWgBRzX2DYvMsDmPQrFzQuNlqmYP+8HzANBgkqhkiG\n9w0BAQsFAAOCAQEAUdR9Vb3y33Yj6X6KGtuthZ08SwjImVQPtknzpajNE5jOJAh8\nquvQnU9nlnMO85fVDU1Dz3lLHGJ/YG1pt1Cqq2QQ200JcWCvBRgdvH6MjHoDQpqZ\nHvQ3vLgOGqCLNQKFuet9BdpsHzsctKvCVaeBqbGpeCtt3Hh/26tgx0rorPLw90A2\nV8QSkZJjlcKkLa58N5CMM8Xz8KLWg3MZeT4DmlUXVCukqK2RGuP2L+aME8dOxqNv\nOnOz1zrL5mR2iJoDpk8+VE/eBDmJX40IJk6jBjWoxAO/RXq+vBozuF5YHN1ujE92\ntO8HItgTp37XT8bJBAiAnt5mxw+NLSqtxk2QdQ==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEDDCCAvSgAwIBAgICY4kwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTMyMDEx\nNDJaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\nem9uIFJEUyBhcC1zb3V0aGVhc3QtMSAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\nAAOCAQ8AMIIBCgKCAQEAr5u9OuLL/OF/fBNUX2kINJLzFl4DnmrhnLuSeSnBPgbb\nqddjf5EFFJBfv7IYiIWEFPDbDG5hoBwgMup5bZDbas+ZTJTotnnxVJTQ6wlhTmns\neHECcg2pqGIKGrxZfbQhlj08/4nNAPvyYCTS0bEcmQ1emuDPyvJBYDDLDU6AbCB5\n6Z7YKFQPTiCBblvvNzchjLWF9IpkqiTsPHiEt21sAdABxj9ityStV3ja/W9BfgxH\nwzABSTAQT6FbDwmQMo7dcFOPRX+hewQSic2Rn1XYjmNYzgEHisdUsH7eeXREAcTw\n61TRvaLH8AiOWBnTEJXPAe6wYfrcSd1pD0MXpoB62wIDAQABo2YwZDAOBgNVHQ8B\nAf8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUytwMiomQOgX5\nIchd+2lDWRUhkikwHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\nKoZIhvcNAQELBQADggEBACf6lRDpfCD7BFRqiWM45hqIzffIaysmVfr+Jr+fBTjP\nuYe/ba1omSrNGG23bOcT9LJ8hkQJ9d+FxUwYyICQNWOy6ejicm4z0C3VhphbTPqj\nyjpt9nG56IAcV8BcRJh4o/2IfLNzC/dVuYJV8wj7XzwlvjysenwdrJCoLadkTr1h\neIdG6Le07sB9IxrGJL9e04afk37h7c8ESGSE4E+oS4JQEi3ATq8ne1B9DQ9SasXi\nIRmhNAaISDzOPdyLXi9N9V9Lwe/DHcja7hgLGYx3UqfjhLhOKwp8HtoZORixAmOI\nHfILgNmwyugAbuZoCazSKKBhQ0wgO0WZ66ZKTMG8Oho=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBzCCAu+gAwIBAgICUYkwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTYxODIx\nMTVaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\nem9uIFJEUyB1cy13ZXN0LTIgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBANCEZBZyu6yJQFZBJmSUZfSZd3Ui2gitczMKC4FLr0QzkbxY+cLa\nuVONIOrPt4Rwi+3h/UdnUg917xao3S53XDf1TDMFEYp4U8EFPXqCn/GXBIWlU86P\nPvBN+gzw3nS+aco7WXb+woTouvFVkk8FGU7J532llW8o/9ydQyDIMtdIkKTuMfho\nOiNHSaNc+QXQ32TgvM9A/6q7ksUoNXGCP8hDOkSZ/YOLiI5TcdLh/aWj00ziL5bj\npvytiMZkilnc9dLY9QhRNr0vGqL0xjmWdoEXz9/OwjmCihHqJq+20MJPsvFm7D6a\n2NKybR9U+ddrjb8/iyLOjURUZnj5O+2+OPcCAwEAAaNmMGQwDgYDVR0PAQH/BAQD\nAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFEBxMBdv81xuzqcK5TVu\npHj+Aor8MB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\nDQEBCwUAA4IBAQBZkfiVqGoJjBI37aTlLOSjLcjI75L5wBrwO39q+B4cwcmpj58P\n3sivv+jhYfAGEbQnGRzjuFoyPzWnZ1DesRExX+wrmHsLLQbF2kVjLZhEJMHF9eB7\nGZlTPdTzHErcnuXkwA/OqyXMpj9aghcQFuhCNguEfnROY9sAoK2PTfnTz9NJHL+Q\nUpDLEJEUfc0GZMVWYhahc0x38ZnSY2SKacIPECQrTI0KpqZv/P+ijCEcMD9xmYEb\njL4en+XKS1uJpw5fIU5Sj0MxhdGstH6S84iAE5J3GM3XHklGSFwwqPYvuTXvANH6\nuboynxRgSae59jIlAK6Jrr6GWMwQRbgcaAlW\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEDDCCAvSgAwIBAgICEkYwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTYxOTUz\nNDdaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\nem9uIFJEUyBhcC1zb3V0aGVhc3QtMiAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\nAAOCAQ8AMIIBCgKCAQEAufodI2Flker8q7PXZG0P0vmFSlhQDw907A6eJuF/WeMo\nGHnll3b4S6nC3oRS3nGeRMHbyU2KKXDwXNb3Mheu+ox+n5eb/BJ17eoj9HbQR1cd\ngEkIciiAltf8gpMMQH4anP7TD+HNFlZnP7ii3geEJB2GGXSxgSWvUzH4etL67Zmn\nTpGDWQMB0T8lK2ziLCMF4XAC/8xDELN/buHCNuhDpxpPebhct0T+f6Arzsiswt2j\n7OeNeLLZwIZvVwAKF7zUFjC6m7/VmTQC8nidVY559D6l0UhhU0Co/txgq3HVsMOH\nPbxmQUwJEKAzQXoIi+4uZzHFZrvov/nDTNJUhC6DqwIDAQABo2YwZDAOBgNVHQ8B\nAf8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUwaZpaCme+EiV\nM5gcjeHZSTgOn4owHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\nKoZIhvcNAQELBQADggEBAAR6a2meCZuXO2TF9bGqKGtZmaah4pH2ETcEVUjkvXVz\nsl+ZKbYjrun+VkcMGGKLUjS812e7eDF726ptoku9/PZZIxlJB0isC/0OyixI8N4M\nNsEyvp52XN9QundTjkl362bomPnHAApeU0mRbMDRR2JdT70u6yAzGLGsUwMkoNnw\n1VR4XKhXHYGWo7KMvFrZ1KcjWhubxLHxZWXRulPVtGmyWg/MvE6KF+2XMLhojhUL\n+9jB3Fpn53s6KMx5tVq1x8PukHmowcZuAF8k+W4gk8Y68wIwynrdZrKRyRv6CVtR\nFZ8DeJgoNZT3y/GT254VqMxxfuy2Ccb/RInd16tEvVk=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEDDCCAvSgAwIBAgICOYIwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTcyMDA1\nMjlaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\nem9uIFJEUyBhcC1ub3J0aGVhc3QtMyAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\nAAOCAQ8AMIIBCgKCAQEA4dMak8W+XW8y/2F6nRiytFiA4XLwePadqWebGtlIgyCS\nkbug8Jv5w7nlMkuxOxoUeD4WhI6A9EkAn3r0REM/2f0aYnd2KPxeqS2MrtdxxHw1\nxoOxk2x0piNSlOz6yog1idsKR5Wurf94fvM9FdTrMYPPrDabbGqiBMsZZmoHLvA3\nZ+57HEV2tU0Ei3vWeGIqnNjIekS+E06KhASxrkNU5vi611UsnYZlSi0VtJsH4UGV\nLhnHl53aZL0YFO5mn/fzuNG/51qgk/6EFMMhaWInXX49Dia9FnnuWXwVwi6uX1Wn\n7kjoHi5VtmC8ZlGEHroxX2DxEr6bhJTEpcLMnoQMqwIDAQABo2YwZDAOBgNVHQ8B\nAf8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQUsUI5Cb3SWB8+\ngv1YLN/ABPMdxSAwHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\nKoZIhvcNAQELBQADggEBAJAF3E9PM1uzVL8YNdzb6fwJrxxqI2shvaMVmC1mXS+w\nG0zh4v2hBZOf91l1EO0rwFD7+fxoI6hzQfMxIczh875T6vUXePKVOCOKI5wCrDad\nzQbVqbFbdhsBjF4aUilOdtw2qjjs9JwPuB0VXN4/jY7m21oKEOcnpe36+7OiSPjN\nxngYewCXKrSRqoj3mw+0w/+exYj3Wsush7uFssX18av78G+ehKPIVDXptOCP/N7W\n8iKVNeQ2QGTnu2fzWsGUSvMGyM7yqT+h1ILaT//yQS8er511aHMLc142bD4D9VSy\nDgactwPDTShK/PXqhvNey9v/sKXm4XatZvwcc8KYlW4=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEDDCCAvSgAwIBAgICcEUwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTgxNjU2\nMjBaFw0yNDA4MjIxNzA4NTBaMIGZMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzEqMCgGA1UEAwwhQW1h\nem9uIFJEUyBhcC1ub3J0aGVhc3QtMSAyMDE5IENBMIIBIjANBgkqhkiG9w0BAQEF\nAAOCAQ8AMIIBCgKCAQEAndtkldmHtk4TVQAyqhAvtEHSMb6pLhyKrIFved1WO3S7\n+I+bWwv9b2W/ljJxLq9kdT43bhvzonNtI4a1LAohS6bqyirmk8sFfsWT3akb+4Sx\n1sjc8Ovc9eqIWJCrUiSvv7+cS7ZTA9AgM1PxvHcsqrcUXiK3Jd/Dax9jdZE1e15s\nBEhb2OEPE+tClFZ+soj8h8Pl2Clo5OAppEzYI4LmFKtp1X/BOf62k4jviXuCSst3\nUnRJzE/CXtjmN6oZySVWSe0rQYuyqRl6//9nK40cfGKyxVnimB8XrrcxUN743Vud\nQQVU0Esm8OVTX013mXWQXJHP2c0aKkog8LOga0vobQIDAQABo2YwZDAOBgNVHQ8B\nAf8EBAMCAQYwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQULmoOS1mFSjj+\nsnUPx4DgS3SkLFYwHwYDVR0jBBgwFoAUc19g2LzLA5j0Kxc0LjZapmD/vB8wDQYJ\nKoZIhvcNAQELBQADggEBAAkVL2P1M2/G9GM3DANVAqYOwmX0Xk58YBHQu6iiQg4j\nb4Ky/qsZIsgT7YBsZA4AOcPKQFgGTWhe9pvhmXqoN3RYltN8Vn7TbUm/ZVDoMsrM\ngwv0+TKxW1/u7s8cXYfHPiTzVSJuOogHx99kBW6b2f99GbP7O1Sv3sLq4j6lVvBX\nFiacf5LAWC925nvlTzLlBgIc3O9xDtFeAGtZcEtxZJ4fnGXiqEnN4539+nqzIyYq\nnvlgCzyvcfRAxwltrJHuuRu6Maw5AGcd2Y0saMhqOVq9KYKFKuD/927BTrbd2JVf\n2sGWyuPZPCk3gq+5pCjbD0c6DkhcMGI6WwxvM5V/zSM=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBzCCAu+gAwIBAgICJDQwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTgxNzAz\nMTVaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\nem9uIFJEUyBldS13ZXN0LTMgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAL9bL7KE0n02DLVtlZ2PL+g/BuHpMYFq2JnE2RgompGurDIZdjmh\n1pxfL3nT+QIVMubuAOy8InRfkRxfpxyjKYdfLJTPJG+jDVL+wDcPpACFVqoV7Prg\npVYEV0lc5aoYw4bSeYFhdzgim6F8iyjoPnObjll9mo4XsHzSoqJLCd0QC+VG9Fw2\nq+GDRZrLRmVM2oNGDRbGpGIFg77aRxRapFZa8SnUgs2AqzuzKiprVH5i0S0M6dWr\ni+kk5epmTtkiDHceX+dP/0R1NcnkCPoQ9TglyXyPdUdTPPRfKCq12dftqll+u4mV\nARdN6WFjovxax8EAP2OAUTi1afY+1JFMj+sCAwEAAaNmMGQwDgYDVR0PAQH/BAQD\nAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFLfhrbrO5exkCVgxW0x3\nY2mAi8lNMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\nDQEBCwUAA4IBAQAigQ5VBNGyw+OZFXwxeJEAUYaXVoP/qrhTOJ6mCE2DXUVEoJeV\nSxScy/TlFA9tJXqmit8JH8VQ/xDL4ubBfeMFAIAo4WzNWDVoeVMqphVEcDWBHsI1\nAETWzfsapRS9yQekOMmxg63d/nV8xewIl8aNVTHdHYXMqhhik47VrmaVEok1UQb3\nO971RadLXIEbVd9tjY5bMEHm89JsZDnDEw1hQXBb67Elu64OOxoKaHBgUH8AZn/2\nzFsL1ynNUjOhCSAA15pgd1vjwc0YsBbAEBPcHBWYBEyME6NLNarjOzBl4FMtATSF\nwWCKRGkvqN8oxYhwR2jf2rR5Mu4DWkK5Q8Ep\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBzCCAu+gAwIBAgICJVUwDQYJKoZIhvcNAQELBQAwgY8xCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSAwHgYDVQQDDBdBbWF6b24gUkRTIFJvb3QgMjAxOSBDQTAeFw0xOTA5MTkxODE2\nNTNaFw0yNDA4MjIxNzA4NTBaMIGUMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2Fz\naGluZ3RvbjEQMA4GA1UEBwwHU2VhdHRsZTEiMCAGA1UECgwZQW1hem9uIFdlYiBT\nZXJ2aWNlcywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzElMCMGA1UEAwwcQW1h\nem9uIFJEUyB1cy1lYXN0LTEgMjAxOSBDQTCCASIwDQYJKoZIhvcNAQEBBQADggEP\nADCCAQoCggEBAM3i/k2u6cqbMdcISGRvh+m+L0yaSIoOXjtpNEoIftAipTUYoMhL\nInXGlQBVA4shkekxp1N7HXe1Y/iMaPEyb3n+16pf3vdjKl7kaSkIhjdUz3oVUEYt\ni8Z/XeJJ9H2aEGuiZh3kHixQcZczn8cg3dA9aeeyLSEnTkl/npzLf//669Ammyhs\nXcAo58yvT0D4E0D/EEHf2N7HRX7j/TlyWvw/39SW0usiCrHPKDLxByLojxLdHzso\nQIp/S04m+eWn6rmD+uUiRteN1hI5ncQiA3wo4G37mHnUEKo6TtTUh+sd/ku6a8HK\nglMBcgqudDI90s1OpuIAWmuWpY//8xEG2YECAwEAAaNmMGQwDgYDVR0PAQH/BAQD\nAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFPqhoWZcrVY9mU7tuemR\nRBnQIj1jMB8GA1UdIwQYMBaAFHNfYNi8ywOY9CsXNC42WqZg/7wfMA0GCSqGSIb3\nDQEBCwUAA4IBAQB6zOLZ+YINEs72heHIWlPZ8c6WY8MDU+Be5w1M+BK2kpcVhCUK\nPJO4nMXpgamEX8DIiaO7emsunwJzMSvavSPRnxXXTKIc0i/g1EbiDjnYX9d85DkC\nE1LaAUCmCZBVi9fIe0H2r9whIh4uLWZA41oMnJx/MOmo3XyMfQoWcqaSFlMqfZM4\n0rNoB/tdHLNuV4eIdaw2mlHxdWDtF4oH+HFm+2cVBUVC1jXKrFv/euRVtsTT+A6i\nh2XBHKxQ1Y4HgAn0jACP2QSPEmuoQEIa57bEKEcZsBR8SDY6ZdTd2HLRIApcCOSF\nMRM8CKLeF658I0XgF8D5EsYoKPsA+74Z+jDH\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEETCCAvmgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgZQxCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSUwIwYDVQQDDBxBbWF6b24gUkRTIEJldGEgUm9vdCAyMDE5IENBMB4XDTE5MDgy\nMDE3MTAwN1oXDTI0MDgxOTE3MzgyNlowgZkxCzAJBgNVBAYTAlVTMRMwEQYDVQQI\nDApXYXNoaW5ndG9uMRAwDgYDVQQHDAdTZWF0dGxlMSIwIAYDVQQKDBlBbWF6b24g\nV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMSowKAYDVQQD\nDCFBbWF6b24gUkRTIEJldGEgdXMtZWFzdC0xIDIwMTkgQ0EwggEiMA0GCSqGSIb3\nDQEBAQUAA4IBDwAwggEKAoIBAQDTNCOlotQcLP8TP82U2+nk0bExVuuMVOgFeVMx\nvbUHZQeIj9ikjk+jm6eTDnnkhoZcmJiJgRy+5Jt69QcRbb3y3SAU7VoHgtraVbxF\nQDh7JEHI9tqEEVOA5OvRrDRcyeEYBoTDgh76ROco2lR+/9uCvGtHVrMCtG7BP7ZB\nsSVNAr1IIRZZqKLv2skKT/7mzZR2ivcw9UeBBTUf8xsfiYVBvMGoEsXEycjYdf6w\nWV+7XS7teNOc9UgsFNN+9AhIBc1jvee5E//72/4F8pAttAg/+mmPUyIKtekNJ4gj\nOAR2VAzGx1ybzWPwIgOudZFHXFduxvq4f1hIRPH0KbQ/gkRrAgMBAAGjZjBkMA4G\nA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQWBBTkvpCD\n6C43rar9TtJoXr7q8dkrrjAfBgNVHSMEGDAWgBStoQwVpbGx87fxB3dEGDqKKnBT\n4TANBgkqhkiG9w0BAQsFAAOCAQEAJd9fOSkwB3uVdsS+puj6gCER8jqmhd3g/J5V\nZjk9cKS8H0e8pq/tMxeJ8kpurPAzUk5RkCspGt2l0BSwmf3ahr8aJRviMX6AuW3/\ng8aKplTvq/WMNGKLXONa3Sq8591J+ce8gtOX/1rDKmFI4wQ/gUzOSYiT991m7QKS\nFr6HMgFuz7RNJbb3Fy5cnurh8eYWA7mMv7laiLwTNsaro5qsqErD5uXuot6o9beT\na+GiKinEur35tNxAr47ax4IRubuIzyfCrezjfKc5raVV2NURJDyKP0m0CCaffAxE\nqn2dNfYc3v1D8ypg3XjHlOzRo32RB04o8ALHMD9LSwsYDLpMag==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEFzCCAv+gAwIBAgICFSUwDQYJKoZIhvcNAQELBQAwgZcxCzAJBgNVBAYTAlVT\nMRAwDgYDVQQHDAdTZWF0dGxlMRMwEQYDVQQIDApXYXNoaW5ndG9uMSIwIAYDVQQK\nDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRT\nMSgwJgYDVQQDDB9BbWF6b24gUkRTIFByZXZpZXcgUm9vdCAyMDE5IENBMB4XDTE5\nMDgyMTIyMzk0N1oXDTI0MDgyMTIyMjk0OVowgZwxCzAJBgNVBAYTAlVTMRMwEQYD\nVQQIDApXYXNoaW5ndG9uMRAwDgYDVQQHDAdTZWF0dGxlMSIwIAYDVQQKDBlBbWF6\nb24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMS0wKwYD\nVQQDDCRBbWF6b24gUkRTIFByZXZpZXcgdXMtZWFzdC0yIDIwMTkgQ0EwggEiMA0G\nCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQD0dB/U7qRnSf05wOi7m10Pa2uPMTJv\nr6U/3Y17a5prq5Zr4++CnSUYarG51YuIf355dKs+7Lpzs782PIwCmLpzAHKWzix6\npOaTQ+WZ0+vUMTxyqgqWbsBgSCyP7pVBiyqnmLC/L4az9XnscrbAX4pNaoJxsuQe\nmzBo6yofjQaAzCX69DuqxFkVTRQnVy7LCFkVaZtjNAftnAHJjVgQw7lIhdGZp9q9\nIafRt2gteihYfpn+EAQ/t/E4MnhrYs4CPLfS7BaYXBycEKC5Muj1l4GijNNQ0Efo\nxG8LSZz7SNgUvfVwiNTaqfLP3AtEAWiqxyMyh3VO+1HpCjT7uNBFtmF3AgMBAAGj\nZjBkMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQW\nBBQtinkdrj+0B2+qdXngV2tgHnPIujAfBgNVHSMEGDAWgBRp0xqULkNh/w2ZVzEI\no2RIY7O03TANBgkqhkiG9w0BAQsFAAOCAQEAtJdqbCxDeMc8VN1/RzCabw9BIL/z\n73Auh8eFTww/sup26yn8NWUkfbckeDYr1BrXa+rPyLfHpg06kwR8rBKyrs5mHwJx\nbvOzXD/5WTdgreB+2Fb7mXNvWhenYuji1MF+q1R2DXV3I05zWHteKX6Dajmx+Uuq\nYq78oaCBSV48hMxWlp8fm40ANCL1+gzQ122xweMFN09FmNYFhwuW+Ao+Vv90ZfQG\nPYwTvN4n/gegw2TYcifGZC2PNX74q3DH03DXe5fvNgRW5plgz/7f+9mS+YHd5qa9\ntYTPUvoRbi169ou6jicsMKUKPORHWhiTpSCWR1FMMIbsAcsyrvtIsuaGCQ==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID/jCCAuagAwIBAgIQdOCSuA9psBpQd8EI368/0DANBgkqhkiG9w0BAQsFADCB\nlzELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdB\nbWF6b24gUkRTIHNhLWVhc3QtMSBSb290IENBIFJTQTIwNDggRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjEwNTE5MTgwNjI2WhgPMjA2MTA1MTkxOTA2MjZaMIGXMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpv\nbiBSRFMgc2EtZWFzdC0xIFJvb3QgQ0EgUlNBMjA0OCBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAN6ftL6w8v3dB2yW\nLjCxSP1D7ZsOTeLZOSCz1Zv0Gkd0XLhil5MdHOHBvwH/DrXqFU2oGzCRuAy+aZis\nDardJU6ChyIQIciXCO37f0K23edhtpXuruTLLwUwzeEPdcnLPCX+sWEn9Y5FPnVm\npCd6J8edH2IfSGoa9LdErkpuESXdidLym/w0tWG/O2By4TabkNSmpdrCL00cqI+c\nprA8Bx1jX8/9sY0gpAovtuFaRN+Ivg3PAnWuhqiSYyQ5nC2qDparOWuDiOhpY56E\nEgmTvjwqMMjNtExfYx6Rv2Ndu50TriiNKEZBzEtkekwXInTupmYTvc7U83P/959V\nUiQ+WSMCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU4uYHdH0+\nbUeh81Eq2l5/RJbW+vswDgYDVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEBCwUAA4IB\nAQBhxcExJ+w74bvDknrPZDRgTeMLYgbVJjx2ExH7/Ac5FZZWcpUpFwWMIJJxtewI\nAnhryzM3tQYYd4CG9O+Iu0+h/VVfW7e4O3joWVkxNMb820kQSEwvZfA78aItGwOY\nWSaFNVRyloVicZRNJSyb1UL9EiJ9ldhxm4LTT0ax+4ontI7zTx6n6h8Sr6r/UOvX\nd9T5aUUENWeo6M9jGupHNn3BobtL7BZm2oS8wX8IVYj4tl0q5T89zDi2x0MxbsIV\n5ZjwqBQ5JWKv7ASGPb+z286RjPA9R2knF4lJVZrYuNV90rHvI/ECyt/JrDqeljGL\nBLl1W/UsvZo6ldLIpoMbbrb5\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBDCCAuygAwIBAgIQUfVbqapkLYpUqcLajpTJWzANBgkqhkiG9w0BAQsFADCB\nmjELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTMwMQYDVQQDDCpB\nbWF6b24gUkRTIG1lLWNlbnRyYWwtMSBSb290IENBIFJTQTIwNDggRzExEDAOBgNV\nBAcMB1NlYXR0bGUwIBcNMjIwNTA2MjMyMDA5WhgPMjA2MjA1MDcwMDIwMDlaMIGa\nMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5j\nLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMzAxBgNVBAMMKkFt\nYXpvbiBSRFMgbWUtY2VudHJhbC0xIFJvb3QgQ0EgUlNBMjA0OCBHMTEQMA4GA1UE\nBwwHU2VhdHRsZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJIeovu3\newI9FVitXMQzvkh34aQ6WyI4NO3YepfJaePiv3cnyFGYHN2S1cR3UQcLWgypP5va\nj6bfroqwGbCbZZcb+6cyOB4ceKO9Ws1UkcaGHnNDcy5gXR7aCW2OGTUfinUuhd2d\n5bOGgV7JsPbpw0bwJ156+MwfOK40OLCWVbzy8B1kITs4RUPNa/ZJnvIbiMu9rdj4\n8y7GSFJLnKCjlOFUkNI5LcaYvI1+ybuNgphT3nuu5ZirvTswGakGUT/Q0J3dxP0J\npDfg5Sj/2G4gXiaM0LppVOoU5yEwVewhQ250l0eQAqSrwPqAkdTg9ng360zqCFPE\nJPPcgI1tdGUgneECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU\n/2AJVxWdZxc8eJgdpbwpW7b0f7IwDgYDVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEB\nCwUAA4IBAQBYm63jTu2qYKJ94gKnqc+oUgqmb1mTXmgmp/lXDbxonjszJDOXFbri\n3CCO7xB2sg9bd5YWY8sGKHaWmENj3FZpCmoefbUx++8D7Mny95Cz8R32rNcwsPTl\nebpd9A/Oaw5ug6M0x/cNr0qzF8Wk9Dx+nFEimp8RYQdKvLDfNFZHjPa1itnTiD8M\nTorAqj+VwnUGHOYBsT/0NY12tnwXdD+ATWfpEHdOXV+kTMqFFwDyhfgRVNpTc+os\nygr8SwhnSCpJPB/EYl2S7r+tgAbJOkuwUvGT4pTqrzDQEhwE7swgepnHC87zhf6l\nqN6mVpSnQKQLm6Ob5TeCEFgcyElsF5bH\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrjCCAjSgAwIBAgIRAOxu0I1QuMAhIeszB3fJIlkwCgYIKoZIzj0EAwMwgZYx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEvMC0GA1UEAwwmQW1h\nem9uIFJEUyB1cy13ZXN0LTIgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTI0MjIwNjU5WhgPMjEyMTA1MjQyMzA2NTlaMIGWMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExLzAtBgNVBAMMJkFtYXpvbiBS\nRFMgdXMtd2VzdC0yIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdTZWF0dGxl\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEz4bylRcGqqDWdP7gQIIoTHdBK6FNtKH1\n4SkEIXRXkYDmRvL9Bci1MuGrwuvrka5TDj4b7e+csY0llEzHpKfq6nJPFljoYYP9\nuqHFkv77nOpJJ633KOr8IxmeHW5RXgrZo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0G\nA1UdDgQWBBQQikVz8wmjd9eDFRXzBIU8OseiGzAOBgNVHQ8BAf8EBAMCAYYwCgYI\nKoZIzj0EAwMDaAAwZQIwf06Mcrpw1O0EBLBBrp84m37NYtOkE/0Z0O+C7D41wnXi\nEQdn6PXUVgdD23Gj82SrAjEAklhKs+liO1PtN15yeZR1Io98nFve+lLptaLakZcH\n+hfFuUtCqMbaI8CdvJlKnPqT\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIGCTCCA/GgAwIBAgIRALyWMTyCebLZOGcZZQmkmfcwDQYJKoZIhvcNAQEMBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1ub3J0aGVhc3QtMyBSb290IENBIFJTQTQwOTYgRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTI0MjAyODAzWhgPMjEyMTA1MjQyMTI4MDNa\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtbm9ydGhlYXN0LTMgUm9vdCBDQSBSU0E0MDk2IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA\nwGFiyDyCrGqgdn4fXG12cxKAAfVvhMea1mw5h9CVRoavkPqhzQpAitSOuMB9DeiP\nwQyqcsiGl/cTEau4L+AUBG8b9v26RlY48exUYBXj8CieYntOT9iNw5WtdYJa3kF/\nJxgI+HDMzE9cmHDs5DOO3S0uwZVyra/xE1ymfSlpOeUIOTpHRJv97CBUEpaZMUW5\nSr6GruuOwFVpO5FX3A/jQlcS+UN4GjSRgDUJuqg6RRQldEZGCVCCmodbByvI2fGm\nreGpsPJD54KkmAX08nOR8e5hkGoHxq0m2DLD4SrOFmt65vG47qnuwplWJjtk9B3Z\n9wDoopwZLBOtlkPIkUllWm1P8EuHC1IKOA+wSP6XdT7cy8S77wgyHzR0ynxv7q/l\nvlZtH30wnNqFI0y9FeogD0TGMCHcnGqfBSicJXPy9T4fU6f0r1HwqKwPp2GArwe7\ndnqLTj2D7M9MyVtFjEs6gfGWXmu1y5uDrf+CszurE8Cycoma+OfjjuVQgWOCy7Nd\njJswPxAroTzVfpgoxXza4ShUY10woZu0/J+HmNmqK7lh4NS75q1tz75in8uTZDkV\nbe7GK+SEusTrRgcf3tlgPjSTWG3veNzFDF2Vn1GLJXmuZfhdlVQDBNXW4MNREExS\ndG57kJjICpT+r8X+si+5j51gRzkSnMYs7VHulpxfcwECAwEAAaNCMEAwDwYDVR0T\nAQH/BAUwAwEB/zAdBgNVHQ4EFgQU4JWOpDBmUBuWKvGPZelw87ezhL8wDgYDVR0P\nAQH/BAQDAgGGMA0GCSqGSIb3DQEBDAUAA4ICAQBRNLMql7itvXSEFQRAnyOjivHz\nl5IlWVQjAbOUr6ogZcwvK6YpxNAFW5zQr8F+fdkiypLz1kk5irx9TIpff0BWC9hQ\n/odMPO8Gxn8+COlSvc+dLsF2Dax3Hvz0zLeKMo+cYisJOzpdR/eKd0/AmFdkvQoM\nAOK9n0yYvVJU2IrSgeJBiiCarpKSeAktEVQ4rvyacQGr+QAPkkjRwm+5LHZKK43W\nnNnggRli9N/27qYtc5bgr3AaQEhEXMI4RxPRXCLsod0ehMGWyRRK728a+6PMMJAJ\nWHOU0x7LCEMPP/bvpLj3BdvSGqNor4ZtyXEbwREry1uzsgODeRRns5acPwTM6ff+\nCmxO2NZ0OktIUSYRmf6H/ZFlZrIhV8uWaIwEJDz71qvj7buhQ+RFDZ9CNL64C0X6\nmf0zJGEpddjANHaaVky+F4gYMtEy2K2Lcm4JGTdyIzUoIe+atzCnRp0QeIcuWtF+\ns8AjDYCVFNypcMmqbRmNpITSnOoCHSRuVkY3gutVoYyMLbp8Jm9SJnCIlEWTA6Rm\nwADOMGZJVn5/XRTRuetVOB3KlQDjs9OO01XN5NzGSZO2KT9ngAUfh9Eqhf1iRWSP\nnZlRbQ2NRCuY/oJ5N59mLGxnNJSE7giEKEBRhTQ/XEPIUYAUPD5fca0arKRJwbol\nl9Se1Hsq0ZU5f+OZKQ==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIGATCCA+mgAwIBAgIRAK7vlRrGVEePJpW1VHMXdlIwDQYJKoZIhvcNAQEMBQAw\ngZgxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTExMC8GA1UEAwwo\nQW1hem9uIFJEUyBhZi1zb3V0aC0xIFJvb3QgQ0EgUlNBNDA5NiBHMTEQMA4GA1UE\nBwwHU2VhdHRsZTAgFw0yMTA1MTkxOTI4NDNaGA8yMTIxMDUxOTIwMjg0M1owgZgx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTExMC8GA1UEAwwoQW1h\nem9uIFJEUyBhZi1zb3V0aC0xIFJvb3QgQ0EgUlNBNDA5NiBHMTEQMA4GA1UEBwwH\nU2VhdHRsZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMZiHOQC6x4o\neC7vVOMCGiN5EuLqPYHdceFPm4h5k/ZejXTf7kryk6aoKZKsDIYihkaZwXVS7Y/y\n7Ig1F1ABi2jD+CYprj7WxXbhpysmN+CKG7YC3uE4jSvfvUnpzionkQbjJsRJcrPO\ncZJM4FVaVp3mlHHtvnM+K3T+ni4a38nAd8xrv1na4+B8ZzZwWZXarfg8lJoGskSn\nou+3rbGQ0r+XlUP03zWujHoNlVK85qUIQvDfTB7n3O4s1XNGvkfv3GNBhYRWJYlB\n4p8T+PFN8wG+UOByp1gV7BD64RnpuZ8V3dRAlO6YVAmINyG5UGrPzkIbLtErUNHO\n4iSp4UqYvztDqJWWHR/rA84ef+I9RVwwZ8FQbjKq96OTnPrsr63A5mXTC9dXKtbw\nXNJPQY//FEdyM3K8sqM0IdCzxCA1MXZ8+QapWVjwyTjUwFvL69HYky9H8eAER59K\n5I7u/CWWeCy2R1SYUBINc3xxLr0CGGukcWPEZW2aPo5ibW5kepU1P/pzdMTaTfao\nF42jSFXbc7gplLcSqUgWwzBnn35HLTbiZOFBPKf6vRRu8aRX9atgHw/EjCebi2xP\nxIYr5Ub8u0QVHIqcnF1/hVzO/Xz0chj3E6VF/yTXnsakm+W1aM2QkZbFGpga+LMy\nmFCtdPrELjea2CfxgibaJX1Q4rdEpc8DAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMB\nAf8wHQYDVR0OBBYEFDSaycEyuspo/NOuzlzblui8KotFMA4GA1UdDwEB/wQEAwIB\nhjANBgkqhkiG9w0BAQwFAAOCAgEAbosemjeTRsL9o4v0KadBUNS3V7gdAH+X4vH2\nEe1Jc91VOGLdd/s1L9UX6bhe37b9WjUD69ur657wDW0RzxMYgQdZ27SUl0tEgGGp\ncCmVs1ky3zEN+Hwnhkz+OTmIg1ufq0W2hJgJiluAx2r1ib1GB+YI3Mo3rXSaBYUk\nbgQuujYPctf0PA153RkeICE5GI3OaJ7u6j0caYEixBS3PDHt2MJWexITvXGwHWwc\nCcrC05RIrTUNOJaetQw8smVKYOfRImEzLLPZ5kf/H3Cbj8BNAFNsa10wgvlPuGOW\nXLXqzNXzrG4V3sjQU5YtisDMagwYaN3a6bBf1wFwFIHQoAPIgt8q5zaQ9WI+SBns\nIl6rd4zfvjq/BPmt0uI7rVg/cgbaEg/JDL2neuM9CJAzmKxYxLQuHSX2i3Fy4Y1B\ncnxnRQETCRZNPGd00ADyxPKVoYBC45/t+yVusArFt+2SVLEGiFBr23eG2CEZu+HS\nnDEgIfQ4V3YOTUNa86wvbAss1gbbnT/v1XCnNGClEWCWNCSRjwV2ZmQ/IVTmNHPo\n7axTTBBJbKJbKzFndCnuxnDXyytdYRgFU7Ly3sa27WS2KFyFEDebLFRHQEfoYqCu\nIupSqBSbXsR3U10OTjc9z6EPo1nuV6bdz+gEDthmxKa1NI+Qb1kvyliXQHL2lfhr\n5zT5+Bs=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIF/zCCA+egAwIBAgIRAOLV6zZcL4IV2xmEneN1GwswDQYJKoZIhvcNAQEMBQAw\ngZcxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEwMC4GA1UEAwwn\nQW1hem9uIFJEUyB1cy13ZXN0LTEgUm9vdCBDQSBSU0E0MDk2IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUxOTE5MDg1OFoYDzIxMjEwNTE5MjAwODU4WjCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIHVzLXdlc3QtMSBSb290IENBIFJTQTQwOTYgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQC7koAKGXXlLixN\nfVjhuqvz0WxDeTQfhthPK60ekRpftkfE5QtnYGzeovaUAiS58MYVzqnnTACDwcJs\nIGTFE6Wd7sB6r8eI/3CwI1pyJfxepubiQNVAQG0zJETOVkoYKe/5KnteKtnEER3X\ntCBRdV/rfbxEDG9ZAsYfMl6zzhEWKF88G6xhs2+VZpDqwJNNALvQuzmTx8BNbl5W\nRUWGq9CQ9GK9GPF570YPCuURW7kl35skofudE9bhURNz51pNoNtk2Z3aEeRx3ouT\nifFJlzh+xGJRHqBG7nt5NhX8xbg+vw4xHCeq1aAe6aVFJ3Uf9E2HzLB4SfIT9bRp\nP7c9c0ySGt+3n+KLSHFf/iQ3E4nft75JdPjeSt0dnyChi1sEKDi0tnWGiXaIg+J+\nr1ZtcHiyYpCB7l29QYMAdD0TjfDwwPayLmq//c20cPmnSzw271VwqjUT0jYdrNAm\ngV+JfW9t4ixtE3xF2jaUh/NzL3bAmN5v8+9k/aqPXlU1BgE3uPwMCjrfn7V0I7I1\nWLpHyd9jF3U/Ysci6H6i8YKgaPiOfySimQiDu1idmPld659qerutUSemQWmPD3bE\ndcjZolmzS9U0Ujq/jDF1YayN3G3xvry1qWkTci0qMRMu2dZu30Herugh9vsdTYkf\n00EqngPbqtIVLDrDjEQLqPcb8QvWFQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/\nMB0GA1UdDgQWBBQBqg8Za/L0YMHURGExHfvPyfLbOTAOBgNVHQ8BAf8EBAMCAYYw\nDQYJKoZIhvcNAQEMBQADggIBACAGPMa1QL7P/FIO7jEtMelJ0hQlQepKnGtbKz4r\nXq1bUX1jnLvnAieR9KZmeQVuKi3g3CDU6b0mDgygS+FL1KDDcGRCSPh238Ou8KcG\nHIxtt3CMwMHMa9gmdcMlR5fJF9vhR0C56KM2zvyelUY51B/HJqHwGvWuexryXUKa\nwq1/iK2/d9mNeOcjDvEIj0RCMI8dFQCJv3PRCTC36XS36Tzr6F47TcTw1c3mgKcs\nxpcwt7ezrXMUunzHS4qWAA5OGdzhYlcv+P5GW7iAA7TDNrBF+3W4a/6s9v2nQAnX\nUvXd9ul0ob71377UhZbJ6SOMY56+I9cJOOfF5QvaL83Sz29Ij1EKYw/s8TYdVqAq\n+dCyQZBkMSnDFLVe3J1KH2SUSfm3O98jdPORQrUlORQVYCHPls19l2F6lCmU7ICK\nhRt8EVSpXm4sAIA7zcnR2nU00UH8YmMQLnx5ok9YGhuh3Ehk6QlTQLJux6LYLskd\n9YHOLGW/t6knVtV78DgPqDeEx/Wu/5A8R0q7HunpWxr8LCPBK6hksZnOoUhhb8IP\nvl46Ve5Tv/FlkyYr1RTVjETmg7lb16a8J0At14iLtpZWmwmuv4agss/1iBVMXfFk\n+ZGtx5vytWU5XJmsfKA51KLsMQnhrLxb3X3zC+JRCyJoyc8++F3YEcRi2pkRYE3q\nHing\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgIRANxgyBbnxgTEOpDul2ZnC0UwDQYJKoZIhvcNAQELBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1zb3V0aGVhc3QtMyBSb290IENBIFJTQTIwNDggRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNjEwMTgxOTA3WhgPMjA2MTA2MTAxOTE5MDda\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtc291dGhlYXN0LTMgUm9vdCBDQSBSU0EyMDQ4IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\nxnwSDAChrMkfk5TA4Dk8hKzStDlSlONzmd3fTG0Wqr5+x3EmFT6Ksiu/WIwEl9J2\nK98UI7vYyuZfCxUKb1iMPeBdVGqk0zb92GpURd+Iz/+K1ps9ZLeGBkzR8mBmAi1S\nOfpwKiTBzIv6E8twhEn4IUpHsdcuX/2Y78uESpJyM8O5CpkG0JaV9FNEbDkJeBUQ\nAo2qqNcH4R0Qcr5pyeqA9Zto1RswgL06BQMI9dTpfwSP5VvkvcNUaLl7Zv5WzLQE\nJzORWePvdPzzvWEkY/3FPjxBypuYwssKaERW0fkPDmPtykktP9W/oJolKUFI6pXp\ny+Y6p6/AVdnQD2zZjW5FhQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\nDgQWBBT+jEKs96LC+/X4BZkUYUkzPfXdqTAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZI\nhvcNAQELBQADggEBAIGQqgqcQ6XSGkmNebzR6DhadTbfDmbYeN5N0Vuzv+Tdmufb\ntMGjdjnYMg4B+IVnTKQb+Ox3pL9gbX6KglGK8HupobmIRtwKVth+gYYz3m0SL/Nk\nhaWPYzOm0x3tJm8jSdufJcEob4/ATce9JwseLl76pSWdl5A4lLjnhPPKudUDfH+1\nBLNUi3lxpp6GkC8aWUPtupnhZuXddolTLOuA3GwTZySI44NfaFRm+o83N1jp+EwD\n6e94M4cTRzjUv6J3MZmSbdtQP/Tk1uz2K4bQZGP0PZC3bVpqiesdE/xr+wbu8uHr\ncM1JXH0AmXf1yIkTgyWzmvt0k1/vgcw5ixAqvvE=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEATCCAumgAwIBAgIRAMhw98EQU18mIji+unM2YH8wDQYJKoZIhvcNAQELBQAw\ngZgxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTExMC8GA1UEAwwo\nQW1hem9uIFJEUyBhcC1zb3V0aC0yIFJvb3QgQ0EgUlNBMjA0OCBHMTEQMA4GA1UE\nBwwHU2VhdHRsZTAgFw0yMjA2MDYyMTQyMjJaGA8yMDYyMDYwNjIyNDIyMlowgZgx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTExMC8GA1UEAwwoQW1h\nem9uIFJEUyBhcC1zb3V0aC0yIFJvb3QgQ0EgUlNBMjA0OCBHMTEQMA4GA1UEBwwH\nU2VhdHRsZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAIeeRoLfTm+7\nvqm7ZlFSx+1/CGYHyYrOOryM4/Z3dqYVHFMgWTR7V3ziO8RZ6yUanrRcWVX3PZbF\nAfX0KFE8OgLsXEZIX8odSrq86+/Th5eZOchB2fDBsUB7GuN2rvFBbM8lTI9ivVOU\nlbuTnYyb55nOXN7TpmH2bK+z5c1y9RVC5iQsNAl6IJNvSN8VCqXh31eK5MlKB4DT\n+Y3OivCrSGsjM+UR59uZmwuFB1h+icE+U0p9Ct3Mjq3MzSX5tQb6ElTNGlfmyGpW\nKh7GQ5XU1KaKNZXoJ37H53woNSlq56bpVrKI4uv7ATpdpFubOnSLtpsKlpLdR3sy\nWs245200pC8CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUp0ki\n6+eWvsnBjQhMxwMW5pwn7DgwDgYDVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEBCwUA\nA4IBAQB2V8lv0aqbYQpj/bmVv/83QfE4vOxKCJAHv7DQ35cJsTyBdF+8pBczzi3t\n3VNL5IUgW6WkyuUOWnE0eqAFOUVj0yTS1jSAtfl3vOOzGJZmWBbqm9BKEdu1D8O6\nsB8bnomwiab2tNDHPmUslpdDqdabbkWwNWzLJ97oGFZ7KNODMEPXWKWNxg33iHfS\n/nlmnrTVI3XgaNK9qLZiUrxu9Yz5gxi/1K+sG9/Dajd32ZxjRwDipOLiZbiXQrsd\nqzIMY4GcWf3g1gHL5mCTfk7dG22h/rhPyGV0svaDnsb+hOt6sv1McMN6Y3Ou0mtM\n/UaAXojREmJmTSCNvs2aBny3/2sy\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrjCCAjSgAwIBAgIRAMnRxsKLYscJV8Qv5pWbL7swCgYIKoZIzj0EAwMwgZYx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEvMC0GA1UEAwwmQW1h\nem9uIFJEUyBzYS1lYXN0LTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTE5MTgxNjAxWhgPMjEyMTA1MTkxOTE2MDFaMIGWMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExLzAtBgNVBAMMJkFtYXpvbiBS\nRFMgc2EtZWFzdC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdTZWF0dGxl\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEjFOCZgTNVKxLKhUxffiDEvTLFhrmIqdO\ndKqVdgDoELEzIHWDdC+19aDPitbCYtBVHl65ITu/9pn6mMUl5hhUNtfZuc6A+Iw1\nsBe0v0qI3y9Q9HdQYrGgeHDh8M5P7E2ho0IwQDAPBgNVHRMBAf8EBTADAQH/MB0G\nA1UdDgQWBBS5L7/8M0TzoBZk39Ps7BkfTB4yJTAOBgNVHQ8BAf8EBAMCAYYwCgYI\nKoZIzj0EAwMDaAAwZQIwI43O0NtWKTgnVv9z0LO5UMZYgSve7GvGTwqktZYCMObE\nrUI4QerXM9D6JwLy09mqAjEAypfkdLyVWtaElVDUyHFkihAS1I1oUxaaDrynLNQK\nOu/Ay+ns+J+GyvyDUjBpVVW1\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIF/jCCA+agAwIBAgIQR71Z8lTO5Sj+as2jB7IWXzANBgkqhkiG9w0BAQwFADCB\nlzELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdB\nbWF6b24gUkRTIHVzLXdlc3QtMiBSb290IENBIFJTQTQwOTYgRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjEwNTI0MjIwMzIwWhgPMjEyMTA1MjQyMzAzMjBaMIGXMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpv\nbiBSRFMgdXMtd2VzdC0yIFJvb3QgQ0EgUlNBNDA5NiBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAM977bHIs1WJijrS\nXQMfUOhmlJjr2v0K0UjPl52sE1TJ76H8umo1yR4T7Whkd9IwBHNGKXCJtJmMr9zp\nfB38eLTu+5ydUAXdFuZpRMKBWwPVe37AdJRKqn5beS8HQjd3JXAgGKUNNuE92iqF\nqi2fIqFMpnJXWo0FIW6s2Dl2zkORd7tH0DygcRi7lgVxCsw1BJQhFJon3y+IV8/F\nbnbUXSNSDUnDW2EhvWSD8L+t4eiXYsozhDAzhBvojpxhPH9OB7vqFYw5qxFx+G0t\nlSLX5iWi1jzzc3XyGnB6WInZDVbvnvJ4BGZ+dTRpOCvsoMIn9bz4EQTvu243c7aU\nHbS/kvnCASNt+zk7C6lbmaq0AGNztwNj85Opn2enFciWZVnnJ/4OeefUWQxD0EPp\nSjEd9Cn2IHzkBZrHCg+lWZJQBKbUVS0lLIMSsLQQ6WvR38jY7D2nxM1A93xWxwpt\nZtQnYRCVXH6zt2OwDAFePInWwxUjR5t/wu3XxPgpSfrmTi3WYtr1wFypAJ811e/P\nyBtswWUQ6BNJQvy+KnOEeGfOwmtdDFYR+GOCfvCihzrKJrxOtHIieehR5Iw3cbXG\nsm4pDzfMUVvDDz6C2M6PRlJhhClbatHCjik9hxFYEsAlqtVVK9pxaz9i8hOqSFQq\nkJSQsgWw+oM/B2CyjcSqkSQEu8RLAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8w\nHQYDVR0OBBYEFPmrdxpRRgu3IcaB5BTqlprcKdTsMA4GA1UdDwEB/wQEAwIBhjAN\nBgkqhkiG9w0BAQwFAAOCAgEAVdlxWjPvVKky3kn8ZizeM4D+EsLw9dWLau2UD/ls\nzwDCFoT6euagVeCknrn+YEl7g20CRYT9iaonGoMUPuMR/cdtPL1W/Rf40PSrGf9q\nQuxavWiHLEXOQTCtCaVZMokkvjuuLNDXyZnstgECuiZECTwhexUF4oiuhyGk9o01\nQMaiz4HX4lgk0ozALUvEzaNd9gWEwD2qe+rq9cQMTVq3IArUkvTIftZUaVUMzr0O\ned1+zAsNa9nJhURJ/6anJPJjbQgb5qA1asFcp9UaMT1ku36U3gnR1T/BdgG2jX3X\nUm0UcaGNVPrH1ukInWW743pxWQb7/2sumEEMVh+jWbB18SAyLI4WIh4lkurdifzS\nIuTFp8TEx+MouISFhz/vJDWZ84tqoLVjkEcP6oDypq9lFoEzHDJv3V1CYcIgOusT\nk1jm9P7BXdTG7TYzUaTb9USb6bkqkD9EwJAOSs7DI94aE6rsSws2yAHavjAMfuMZ\nsDAZvkqS2Qg2Z2+CI6wUZn7mzkJXbZoqRjDvChDXEB1mIhzVXhiNW/CR5WKVDvlj\n9v1sdGByh2pbxcLQtVaq/5coM4ANgphoNz3pOYUPWHS+JUrIivBZ+JobjXcxr3SN\n9iDzcu5/FVVNbq7+KN/nvPMngT+gduEN5m+EBjm8GukJymFG0m6BENRA0QSDqZ7k\nzDY=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgIRAK5EYG3iHserxMqgg+0EFjgwDQYJKoZIhvcNAQELBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1ub3J0aGVhc3QtMyBSb290IENBIFJTQTIwNDggRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTI0MjAyMzE2WhgPMjA2MTA1MjQyMTIzMTZa\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtbm9ydGhlYXN0LTMgUm9vdCBDQSBSU0EyMDQ4IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\ns1L6TtB84LGraLHVC+rGPhLBW2P0oN/91Rq3AnYwqDOuTom7agANwEjvLq7dSRG/\nsIfZsSV/ABTgArZ5sCmLjHFZAo8Kd45yA9byx20RcYtAG8IZl+q1Cri+s0XefzyO\nU6mlfXZkVe6lzjlfXBkrlE/+5ifVbJK4dqOS1t9cWIpgKqv5fbE6Qbq4LVT+5/WM\nVd2BOljuBMGMzdZubqFKFq4mzTuIYfnBm7SmHlZfTdfBYPP1ScNuhpjuzw4n3NCR\nEdU6dQv04Q6th4r7eiOCwbWI9LkmVbvBe3ylhH63lApC7MiiPYLlB13xBubVHVhV\nq1NHoNTi+zA3MN9HWicRxQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\nDgQWBBSuxoqm0/wjNiZLvqv+JlQwsDvTPDAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZI\nhvcNAQELBQADggEBAFfTK/j5kv90uIbM8VaFdVbr/6weKTwehafT0pAk1bfLVX+7\nuf8oHgYiyKTTl0DFQicXejghXTeyzwoEkWSR8c6XkhD5vYG3oESqmt/RGvvoxz11\nrHHy7yHYu7RIUc3VQG60c4qxXv/1mWySGwVwJrnuyNT9KZXPevu3jVaWOVHEILaK\nHvzQ2YEcWBPmde/zEseO2QeeGF8FL45Q1d66wqIP4nNUd2pCjeTS5SpB0MMx7yi9\nki1OH1pv8tOuIdimtZ7wkdB8+JSZoaJ81b8sRrydRwJyvB88rftuI3YB4WwGuONT\nZezUPsmaoK69B0RChB0ofDpAaviF9V3xOWvVZfo=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\n1axqeKpI0F5SBUPsaVNYY2uNFg==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECDCCAvCgAwIBAgIQCREfzzVyDTMcNME+gWnTCTANBgkqhkiG9w0BAQsFADCB\nnDELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTUwMwYDVQQDDCxB\nbWF6b24gUkRTIGFwLXNvdXRoZWFzdC0yIFJvb3QgQ0EgUlNBMjA0OCBHMTEQMA4G\nA1UEBwwHU2VhdHRsZTAgFw0yMTA1MjQyMDQyMzNaGA8yMDYxMDUyNDIxNDIzM1ow\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1zb3V0aGVhc3QtMiBSb290IENBIFJTQTIwNDggRzExEDAO\nBgNVBAcMB1NlYXR0bGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDL\n1MT6br3L/4Pq87DPXtcjlXN3cnbNk2YqRAZHJayStTz8VtsFcGPJOpk14geRVeVk\ne9uKFHRbcyr/RM4owrJTj5X4qcEuATYZbo6ou/rW2kYzuWFZpFp7lqm0vasV4Z9F\nfChlhwkNks0UbM3G+psCSMNSoF19ERunj7w2c4E62LwujkeYLvKGNepjnaH10TJL\n2krpERd+ZQ4jIpObtRcMH++bTrvklc+ei8W9lqrVOJL+89v2piN3Ecdd389uphst\nqQdb1BBVXbhUrtuGHgVf7zKqN1SkCoktoWxVuOprVWhSvr7akaWeq0UmlvbEsujU\nvADqxGMcJFyCzxx3CkJjAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0O\nBBYEFFk8UJmlhoxFT3PP12PvhvazHjT4MA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG\n9w0BAQsFAAOCAQEAfFtr2lGoWVXmWAsIo2NYre7kzL8Xb9Tx7desKxCCz5HOOvIr\n8JMB1YK6A7IOvQsLJQ/f1UnKRh3X3mJZjKIywfrMSh0FiDf+rjcEzXxw2dGtUem4\nA+WMvIA3jwxnJ90OQj5rQ8bg3iPtE6eojzo9vWQGw/Vu48Dtw1DJo9210Lq/6hze\nhPhNkFh8fMXNT7Q1Wz/TJqJElyAQGNOXhyGpHKeb0jHMMhsy5UNoW5hLeMS5ffao\nTBFWEJ1gVfxIU9QRxSh+62m46JIg+dwDlWv8Aww14KgepspRbMqDuaM2cinoejv6\nt3dyOyHHrsOyv3ffZUKtQhQbQr+sUcL89lARsg==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID/zCCAuegAwIBAgIRAIJLTMpzGNxqHZ4t+c1MlCIwDQYJKoZIhvcNAQELBQAw\ngZcxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEwMC4GA1UEAwwn\nQW1hem9uIFJEUyBhcC1lYXN0LTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyNTIxMzAzM1oYDzIwNjEwNTI1MjIzMDMzWjCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGFwLWVhc3QtMSBSb290IENBIFJTQTIwNDggRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDtdHut0ZhJ9Nn2\nMpVafFcwHdoEzx06okmmhjJsNy4l9QYVeh0UUoek0SufRNMRF4d5ibzpgZol0Y92\n/qKWNe0jNxhEj6sXyHsHPeYtNBPuDMzThfbvsLK8z7pBP7vVyGPGuppqW/6m4ZBB\nlcc9fsf7xpZ689iSgoyjiT6J5wlVgmCx8hFYc/uvcRtfd8jAHvheug7QJ3zZmIye\nV4htOW+fRVWnBjf40Q+7uTv790UAqs0Zboj4Yil+hER0ibG62y1g71XcCyvcVpto\n2/XW7Y9NCgMNqQ7fGN3wR1gjtSYPd7DO32LTzYhutyvfbpAZjsAHnoObmoljcgXI\nQjfBcCFpAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFJI3aWLg\nCS5xqU5WYVaeT5s8lpO0MA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0BAQsFAAOC\nAQEAUwATpJOcGVOs3hZAgJwznWOoTzOVJKfrqBum7lvkVH1vBwxBl9CahaKj3ZOt\nYYp2qJzhDUWludL164DL4ZjS6eRedLRviyy5cRy0581l1MxPWTThs27z+lCC14RL\nPJZNVYYdl7Jy9Q5NsQ0RBINUKYlRY6OqGDySWyuMPgno2GPbE8aynMdKP+f6G/uE\nYHOf08gFDqTsbyfa70ztgVEJaRooVf5JJq4UQtpDvVswW2reT96qi6tXPKHN5qp3\n3wI0I1Mp4ePmiBKku2dwYzPfrJK/pQlvu0Gu5lKOQ65QdotwLAAoaFqrf9za1yYs\nINUkHLWIxDds+4OHNYcerGp5Dw==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIGCTCCA/GgAwIBAgIRAIO6ldra1KZvNWJ0TA1ihXEwDQYJKoZIhvcNAQEMBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1zb3V0aGVhc3QtMSBSb290IENBIFJTQTQwOTYgRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTIxMjE0NTA1WhgPMjEyMTA1MjEyMjQ1MDVa\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtc291dGhlYXN0LTEgUm9vdCBDQSBSU0E0MDk2IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA\nsDN52Si9pFSyZ1ruh3xAN0nVqEs960o2IK5CPu/ZfshFmzAwnx/MM8EHt/jMeZtj\nSM58LADAsNDL01ELpFZATjgZQ6xNAyXRXE7RiTRUvNkK7O3o2qAGbLnJq/UqF7Sw\nLRnB8V6hYOv+2EjVnohtGCn9SUFGZtYDjWXsLd4ML4Zpxv0a5LK7oEC7AHzbUR7R\njsjkrXqSv7GE7bvhSOhMkmgxgj1F3J0b0jdQdtyyj109aO0ATUmIvf+Bzadg5AI2\nA9UA+TUcGeebhpHu8AP1Hf56XIlzPpaQv3ZJ4vzoLaVNUC7XKzAl1dlvCl7Klg/C\n84qmbD/tjZ6GHtzpLKgg7kQEV7mRoXq8X4wDX2AFPPQl2fv+Kbe+JODqm5ZjGegm\nuskABBi8IFv1hYx9jEulZPxC6uD/09W2+niFm3pirnlWS83BwVDTUBzF+CooUIMT\njhWkIIZGDDgMJTzouBHfoSJtS1KpUZi99m2WyVs21MNKHeWAbs+zmI6TO5iiMC+T\nuB8spaOiHFO1573Fmeer4sy3YA6qVoqVl6jjTQqOdy3frAMbCkwH22/crV8YA+08\nhLeHXrMK+6XUvU+EtHAM3VzcrLbuYJUI2XJbzTj5g0Eb8I8JWsHvWHR5K7Z7gceR\n78AzxQmoGEfV6KABNWKsgoCQnfb1BidDJIe3BsI0A6UCAwEAAaNCMEAwDwYDVR0T\nAQH/BAUwAwEB/zAdBgNVHQ4EFgQUABp0MlB14MSHgAcuNSOhs3MOlUcwDgYDVR0P\nAQH/BAQDAgGGMA0GCSqGSIb3DQEBDAUAA4ICAQCv4CIOBSQi/QR9NxdRgVAG/pAh\ntFJhV7OWb/wqwsNKFDtg6tTxwaahdCfWpGWId15OUe7G9LoPiKiwM9C92n0ZeHRz\n4ewbrQVo7Eu1JI1wf0rnZJISL72hVYKmlvaWaacHhWxvsbKLrB7vt6Cknxa+S993\nKf8i2Psw8j5886gaxhiUtzMTBwoDWak8ZaK7m3Y6C6hXQk08+3pnIornVSFJ9dlS\nPAqt5UPwWmrEfF+0uIDORlT+cvrAwgSp7nUF1q8iasledycZ/BxFgQqzNwnkBDwQ\nZ/aM52ArGsTzfMhkZRz9HIEhz1/0mJw8gZtDVQroD8778h8zsx2SrIz7eWQ6uWsD\nQEeSWXpcheiUtEfzkDImjr2DLbwbA23c9LoexUD10nwohhoiQQg77LmvBVxeu7WU\nE63JqaYUlOLOzEmNJp85zekIgR8UTkO7Gc+5BD7P4noYscI7pPOL5rP7YLg15ZFi\nega+G53NTckRXz4metsd8XFWloDjZJJq4FfD60VuxgXzoMNT9wpFTNSH42PR2s9L\nI1vcl3w8yNccs9se2utM2nLsItZ3J0m/+QSRiw9hbrTYTcM9sXki0DtH2kyIOwYf\nlOrGJDiYOIrXSQK36H0gQ+8omlrUTvUj4msvkXuQjlfgx6sgp2duOAfnGxE7uHnc\nUhnJzzoe6M+LfGHkVQ==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICuDCCAj2gAwIBAgIQSAG6j2WHtWUUuLGJTPb1nTAKBggqhkjOPQQDAzCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLW5vcnRoZWFzdC0yIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyMDE2MzgyNloYDzIxMjEwNTIwMTczODI2WjCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLW5vcnRoZWFzdC0yIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAE2eqwU4FOzW8RV1W381Bd\nolhDOrqoMqzWli21oDUt7y8OnXM/lmAuOS6sr8Nt61BLVbONdbr+jgCYw75KabrK\nZGg3siqvMOgabIKkKuXO14wtrGyGDt7dnKXg5ERGYOZlo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBS1Acp2WYxOcblv5ikZ3ZIbRCCW+zAOBgNVHQ8BAf8E\nBAMCAYYwCgYIKoZIzj0EAwMDaQAwZgIxAJL84J08PBprxmsAKPTotBuVI3MyW1r8\nxQ0i8lgCQUf8GcmYjQ0jI4oZyv+TuYJAcwIxAP9Xpzq0Docxb+4N1qVhpiOfWt1O\nFnemFiy9m1l+wv6p3riQMPV7mBVpklmijkIv3Q==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgIRALZLcqCVIJ25maDPE3sbPCIwDQYJKoZIhvcNAQELBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1zb3V0aGVhc3QtMSBSb290IENBIFJTQTIwNDggRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTIxMjEzOTM5WhgPMjA2MTA1MjEyMjM5Mzla\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtc291dGhlYXN0LTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\nypKc+6FfGx6Gl6fQ78WYS29QoKgQiur58oxR3zltWeg5fqh9Z85K5S3UbRSTqWWu\nXcfnkz0/FS07qHX+nWAGU27JiQb4YYqhjZNOAq8q0+ptFHJ6V7lyOqXBq5xOzO8f\n+0DlbJSsy7GEtJp7d7QCM3M5KVY9dENVZUKeJwa8PC5StvwPx4jcLeZRJC2rAVDG\nSW7NAInbATvr9ssSh03JqjXb+HDyywiqoQ7EVLtmtXWimX+0b3/2vhqcH5jgcKC9\nIGFydrjPbv4kwMrKnm6XlPZ9L0/3FMzanXPGd64LQVy51SI4d5Xymn0Mw2kMX8s6\nNf05OsWcDzJ1n6/Q1qHSxQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\nDgQWBBRmaIc8eNwGP7i6P7AJrNQuK6OpFzAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZI\nhvcNAQELBQADggEBAIBeHfGwz3S2zwIUIpqEEI5/sMySDeS+3nJR+woWAHeO0C8i\nBJdDh+kzzkP0JkWpr/4NWz84/IdYo1lqASd1Kopz9aT1+iROXaWr43CtbzjXb7/X\nZv7eZZFC8/lS5SROq42pPWl4ekbR0w8XGQElmHYcWS41LBfKeHCUwv83ATF0XQ6I\n4t+9YSqZHzj4vvedrvcRInzmwWJaal9s7Z6GuwTGmnMsN3LkhZ+/GD6oW3pU/Pyh\nEtWqffjsLhfcdCs3gG8x9BbkcJPH5aPAVkPn4wc8wuXg6xxb9YGsQuY930GWTYRf\nschbgjsuqznW4HHakq4WNhs1UdTSTKkRdZz7FUQ=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEDzCCAvegAwIBAgIRAM2zAbhyckaqRim63b+Tib8wDQYJKoZIhvcNAQELBQAw\ngZ8xCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE4MDYGA1UEAwwv\nQW1hem9uIFJEUyBQcmV2aWV3IHVzLWVhc3QtMiBSb290IENBIFJTQTIwNDggRzEx\nEDAOBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTE4MjA0OTQ1WhgPMjA2MTA1MTgyMTQ5\nNDVaMIGfMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNl\ncywgSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExODA2BgNV\nBAMML0FtYXpvbiBSRFMgUHJldmlldyB1cy1lYXN0LTIgUm9vdCBDQSBSU0EyMDQ4\nIEcxMRAwDgYDVQQHDAdTZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB\nCgKCAQEA1ybjQMH1MkbvfKsWJaCTXeCSN1SG5UYid+Twe+TjuSqaXWonyp4WRR5z\ntlkqq+L2MWUeQQAX3S17ivo/t84mpZ3Rla0cx39SJtP3BiA2BwfUKRjhPwOjmk7j\n3zrcJjV5k1vSeLNOfFFSlwyDiVyLAE61lO6onBx+cRjelu0egMGq6WyFVidTdCmT\nQ9Zw3W6LTrnPvPmEyjHy2yCHzH3E50KSd/5k4MliV4QTujnxYexI2eR8F8YQC4m3\nDYjXt/MicbqA366SOoJA50JbgpuVv62+LSBu56FpzY12wubmDZsdn4lsfYKiWxUy\nuc83a2fRXsJZ1d3whxrl20VFtLFHFQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/\nMB0GA1UdDgQWBBRC0ytKmDYbfz0Bz0Psd4lRQV3aNTAOBgNVHQ8BAf8EBAMCAYYw\nDQYJKoZIhvcNAQELBQADggEBAGv8qZu4uaeoF6zsbumauz6ea6tdcWt+hGFuwGrb\ntRbI85ucAmVSX06x59DJClsb4MPhL1XmqO3RxVMIVVfRwRHWOsZQPnXm8OYQ2sny\nrYuFln1COOz1U/KflZjgJmxbn8x4lYiTPZRLarG0V/OsCmnLkQLPtEl/spMu8Un7\nr3K8SkbWN80gg17Q8EV5mnFwycUx9xsTAaFItuG0en9bGsMgMmy+ZsDmTRbL+lcX\nFq8r4LT4QjrFz0shrzCwuuM4GmcYtBSxlacl+HxYEtAs5k10tmzRf6OYlY33tGf6\n1tkYvKryxDPF/EDgGp/LiBwx6ixYMBfISoYASt4V/ylAlHA=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICtTCCAjqgAwIBAgIRAK9BSZU6nIe6jqfODmuVctYwCgYIKoZIzj0EAwMwgZkx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEyMDAGA1UEAwwpQW1h\nem9uIFJEUyBjYS1jZW50cmFsLTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjEwNTIxMjIxMzA5WhgPMjEyMTA1MjEyMzEzMDlaMIGZMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMjAwBgNVBAMMKUFtYXpv\nbiBSRFMgY2EtY2VudHJhbC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEUkEERcgxneT5H+P+fERcbGmf\nbVx+M7rNWtgWUr6w+OBENebQA9ozTkeSg4c4M+qdYSObFqjxITdYxT1z/nHz1gyx\nOKAhLjWu+nkbRefqy3RwXaWT680uUaAP6ccnkZOMo0IwQDAPBgNVHRMBAf8EBTAD\nAQH/MB0GA1UdDgQWBBSN6fxlg0s5Wny08uRBYZcQ3TUoyzAOBgNVHQ8BAf8EBAMC\nAYYwCgYIKoZIzj0EAwMDaQAwZgIxAORaz+MBVoFBTmZ93j2G2vYTwA6T5hWzBWrx\nCrI54pKn5g6At56DBrkjrwZF5T1enAIxAJe/LZ9xpDkAdxDgGJFN8gZYLRWc0NRy\nRb4hihy5vj9L+w9uKc9VfEBIFuhT7Z3ljg==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEADCCAuigAwIBAgIQB/57HSuaqUkLaasdjxUdPjANBgkqhkiG9w0BAQsFADCB\nmDELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChB\nbWF6b24gUkRTIGFwLXNvdXRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUxOTE3NDAzNFoYDzIwNjEwNTE5MTg0MDM0WjCBmDEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChBbWF6\nb24gUkRTIGFwLXNvdXRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtbkaoVsUS76o\nTgLFmcnaB8cswBk1M3Bf4IVRcwWT3a1HeJSnaJUqWHCJ+u3ip/zGVOYl0gN1MgBb\nMuQRIJiB95zGVcIa6HZtx00VezDTr3jgGWRHmRjNVCCHGmxOZWvJjsIE1xavT/1j\nQYV/ph4EZEIZ/qPq7e3rHohJaHDe23Z7QM9kbyqp2hANG2JtU/iUhCxqgqUHNozV\nZd0l5K6KnltZQoBhhekKgyiHqdTrH8fWajYl5seD71bs0Axowb+Oh0rwmrws3Db2\nDh+oc2PwREnjHeca9/1C6J2vhY+V0LGaJmnnIuOANrslx2+bgMlyhf9j0Bv8AwSi\ndSWsobOhNQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQb7vJT\nVciLN72yJGhaRKLn6Krn2TAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZIhvcNAQELBQAD\nggEBAAxEj8N9GslReAQnNOBpGl8SLgCMTejQ6AW/bapQvzxrZrfVOZOYwp/5oV0f\n9S1jcGysDM+DrmfUJNzWxq2Y586R94WtpH4UpJDGqZp+FuOVJL313te4609kopzO\nlDdmd+8z61+0Au93wB1rMiEfnIMkOEyt7D2eTFJfJRKNmnPrd8RjimRDlFgcLWJA\n3E8wca67Lz/G0eAeLhRHIXv429y8RRXDtKNNz0wA2RwURWIxyPjn1fHjA9SPDkeW\nE1Bq7gZj+tBnrqz+ra3yjZ2blss6Ds3/uRY6NYqseFTZWmQWT7FolZEnT9vMUitW\nI0VynUbShVpGf6946e0vgaaKw20=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID/jCCAuagAwIBAgIQGyUVTaVjYJvWhroVEiHPpDANBgkqhkiG9w0BAQsFADCB\nlzELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdB\nbWF6b24gUkRTIHVzLXdlc3QtMSBSb290IENBIFJTQTIwNDggRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjEwNTE5MTkwNDA2WhgPMjA2MTA1MTkyMDA0MDZaMIGXMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpv\nbiBSRFMgdXMtd2VzdC0xIFJvb3QgQ0EgUlNBMjA0OCBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANhyXpJ0t4nigRDZ\nEwNtFOem1rM1k8k5XmziHKDvDk831p7QsX9ZOxl/BT59Pu/P+6W6SvasIyKls1sW\nFJIjFF+6xRQcpoE5L5evMgN/JXahpKGeQJPOX9UEXVW5B8yi+/dyUitFT7YK5LZA\nMqWBN/LtHVPa8UmE88RCDLiKkqiv229tmwZtWT7nlMTTCqiAHMFcryZHx0pf9VPh\nx/iPV8p2gBJnuPwcz7z1kRKNmJ8/cWaY+9w4q7AYlAMaq/rzEqDaN2XXevdpsYAK\nTMMj2kji4x1oZO50+VPNfBl5ZgJc92qz1ocF95SAwMfOUsP8AIRZkf0CILJYlgzk\n/6u6qZECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUm5jfcS9o\n+LwL517HpB6hG+PmpBswDgYDVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEBCwUAA4IB\nAQAcQ6lsqxi63MtpGk9XK8mCxGRLCad51+MF6gcNz6i6PAqhPOoKCoFqdj4cEQTF\nF8dCfa3pvfJhxV6RIh+t5FCk/y6bWT8Ls/fYKVo6FhHj57bcemWsw/Z0XnROdVfK\nYqbc7zvjCPmwPHEqYBhjU34NcY4UF9yPmlLOL8uO1JKXa3CAR0htIoW4Pbmo6sA4\n6P0co/clW+3zzsQ92yUCjYmRNeSbdXbPfz3K/RtFfZ8jMtriRGuO7KNxp8MqrUho\nHK8O0mlSUxGXBZMNicfo7qY8FD21GIPH9w5fp5oiAl7lqFzt3E3sCLD3IiVJmxbf\nfUwpGd1XZBBSdIxysRLM6j48\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrTCCAjOgAwIBAgIQU+PAILXGkpoTcpF200VD/jAKBggqhkjOPQQDAzCBljEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMS8wLQYDVQQDDCZBbWF6\nb24gUkRTIGFwLWVhc3QtMSBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTAgFw0yMTA1MjUyMTQ1MTFaGA8yMTIxMDUyNTIyNDUxMVowgZYxCzAJBgNV\nBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYD\nVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEvMC0GA1UEAwwmQW1hem9uIFJE\nUyBhcC1lYXN0LTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1NlYXR0bGUw\ndjAQBgcqhkjOPQIBBgUrgQQAIgNiAAT3tFKE8Kw1sGQAvNLlLhd8OcGhlc7MiW/s\nNXm3pOiCT4vZpawKvHBzD76Kcv+ZZzHRxQEmG1/muDzZGlKR32h8AAj+NNO2Wy3d\nCKTtYMiVF6Z2zjtuSkZQdjuQbe4eQ7qjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYD\nVR0OBBYEFAiSQOp16Vv0Ohpvqcbd2j5RmhYNMA4GA1UdDwEB/wQEAwIBhjAKBggq\nhkjOPQQDAwNoADBlAjBVsi+5Ape0kOhMt/WFkANkslD4qXA5uqhrfAtH29Xzz2NV\ntR7akiA771OaIGB/6xsCMQCZt2egCtbX7J0WkuZ2KivTh66jecJr5DHvAP4X2xtS\nF/5pS+AUhcKTEGjI9jDH3ew=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICuDCCAj2gAwIBAgIQT5mGlavQzFHsB7hV6Mmy6TAKBggqhkjOPQQDAzCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLXNvdXRoZWFzdC0yIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyNDIwNTAxNVoYDzIxMjEwNTI0MjE1MDE1WjCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLXNvdXRoZWFzdC0yIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEcm4BBBjYK7clwm0HJRWS\nflt3iYwoJbIXiXn9c1y3E+Vb7bmuyKhS4eO8mwO4GefUcXObRfoHY2TZLhMJLVBQ\n7MN2xDc0RtZNj07BbGD3VAIFRTDX0mH9UNYd0JQM3t/Oo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBRrd5ITedfAwrGo4FA9UaDaGFK3rjAOBgNVHQ8BAf8E\nBAMCAYYwCgYIKoZIzj0EAwMDaQAwZgIxAPBNqmVv1IIA3EZyQ6XuVf4gj79/DMO8\nbkicNS1EcBpUqbSuU4Zwt2BYc8c/t7KVOQIxAOHoWkoKZPiKyCxfMtJpCZySUG+n\nsXgB/LOyWE5BJcXUfm+T1ckeNoWeUUMOLmnJjg==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgIRAJcDeinvdNrDQBeJ8+t38WQwDQYJKoZIhvcNAQELBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1zb3V0aGVhc3QtNCBSb290IENBIFJTQTIwNDggRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjIwNTI1MTY0OTE2WhgPMjA2MjA1MjUxNzQ5MTZa\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtc291dGhlYXN0LTQgUm9vdCBDQSBSU0EyMDQ4IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\nk8DBNkr9tMoIM0NHoFiO7cQfSX0cOMhEuk/CHt0fFx95IBytx7GHCnNzpM27O5z6\nx6iRhfNnx+B6CrGyCzOjxvPizneY+h+9zfvNz9jj7L1I2uYMuiNyOKR6FkHR46CT\n1CiArfVLLPaTqgD/rQjS0GL2sLHS/0dmYipzynnZcs613XT0rAWdYDYgxDq7r/Yi\nXge5AkWQFkMUq3nOYDLCyGGfQqWKkwv6lZUHLCDKf+Y0Uvsrj8YGCI1O8mF0qPCQ\nlmlfaDvbuBu1AV+aabmkvyFj3b8KRIlNLEtQ4N8KGYR2Jdb82S4YUGIOAt4wuuFt\n1B7AUDLk3V/u+HTWiwfoLQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\nDgQWBBSNpcjz6ArWBtAA+Gz6kyyZxrrgdDAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZI\nhvcNAQELBQADggEBAGJEd7UgOzHYIcQRSF7nSYyjLROyalaIV9AX4WXW/Cqlul1c\nMblP5etDZm7A/thliZIWAuyqv2bNicmS3xKvNy6/QYi1YgxZyy/qwJ3NdFl067W0\nt8nGo29B+EVK94IPjzFHWShuoktIgp+dmpijB7wkTIk8SmIoe9yuY4+hzgqk+bo4\nms2SOXSN1DoQ75Xv+YmztbnZM8MuWhL1T7hA4AMorzTQLJ9Pof8SpSdMHeDsHp0R\n01jogNFkwy25nw7cL62nufSuH2fPYGWXyNDg+y42wKsKWYXLRgUQuDVEJ2OmTFMB\nT0Vf7VuNijfIA9hkN2d3K53m/9z5WjGPSdOjGhg=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID/jCCAuagAwIBAgIQRiwspKyrO0xoxDgSkqLZczANBgkqhkiG9w0BAQsFADCB\nlzELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdB\nbWF6b24gUkRTIHVzLXdlc3QtMiBSb290IENBIFJTQTIwNDggRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjEwNTI0MjE1OTAwWhgPMjA2MTA1MjQyMjU5MDBaMIGXMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpv\nbiBSRFMgdXMtd2VzdC0yIFJvb3QgQ0EgUlNBMjA0OCBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL53Jk3GsKiu+4bx\njDfsevWbwPCNJ3H08Zp7GWhvI3Tgi39opfHYv2ku2BKFjK8N2L6RvNPSR8yplv5j\nY0tK0U+XVNl8o0ibhqRDhbTuh6KL8CFINWYzAajuxFS+CF0U6c1Q3tXLBdALxA7l\nFlXJ71QrP06W31kRe7kvgrvO7qWU3/OzUf9qYw4LSiR1/VkvvRCTqcVNw09clw/M\nJbw6FSgweN65M9j7zPbjGAXSHkXyxH1Erin2fa+B9PE4ZDgX9cp2C1DHewYJQL/g\nSepwwcudVNRN1ibKH7kpMrgPnaNIVNx5sXVsTjk6q2ZqYw3SVHegltJpLy/cZReP\nmlivF2kCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUmTcQd6o1\nCuS65MjBrMwQ9JJjmBwwDgYDVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEBCwUAA4IB\nAQAKSDSIzl956wVddPThf2VAzI8syw9ngSwsEHZvxVGHBvu5gg618rDyguVCYX9L\n4Kw/xJrk6S3qxOS2ZDyBcOpsrBskgahDFIunzoRP3a18ARQVq55LVgfwSDQiunch\nBd05cnFGLoiLkR5rrkgYaP2ftn3gRBRaf0y0S3JXZ2XB3sMZxGxavYq9mfiEcwB0\nLMTMQ1NYzahIeG6Jm3LqRqR8HkzP/Ztq4dT2AtSLvFebbNMiWqeqT7OcYp94HTYT\nzqrtaVdUg9bwyAUCDgy0GV9RHDIdNAOInU/4LEETovrtuBU7Z1q4tcHXvN6Hd1H8\ngMb0mCG5I393qW5hFsA/diFb\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgIRAPQAvihfjBg/JDbj6U64K98wDQYJKoZIhvcNAQELBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1ub3J0aGVhc3QtMiBSb290IENBIFJTQTIwNDggRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTIwMTYyODQxWhgPMjA2MTA1MjAxNzI4NDFa\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtbm9ydGhlYXN0LTIgUm9vdCBDQSBSU0EyMDQ4IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\nvJ9lgyksCxkBlY40qOzI1TCj/Q0FVGuPL/Z1Mw2YN0l+41BDv0FHApjTUkIKOeIP\nnwDwpXTa3NjYbk3cOZ/fpH2rYJ++Fte6PNDGPgKppVCUh6x3jiVZ1L7wOgnTdK1Q\nTrw8440IDS5eLykRHvz8OmwvYDl0iIrt832V0QyOlHTGt6ZJ/aTQKl12Fy3QBLv7\nstClPzvHTrgWqVU6uidSYoDtzHbU7Vda7YH0wD9IUoMBf7Tu0rqcE4uH47s2XYkc\nSdLEoOg/Ngs7Y9B1y1GCyj3Ux7hnyvCoRTw014QyNB7dTatFMDvYlrRDGG14KeiU\nUL7Vo/+EejWI31eXNLw84wIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\nDgQWBBQkgTWFsNg6wA3HbbihDQ4vpt1E2zAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZI\nhvcNAQELBQADggEBAGz1Asiw7hn5WYUj8RpOCzpE0h/oBZcnxP8wulzZ5Xd0YxWO\n0jYUcUk3tTQy1QvoY+Q5aCjg6vFv+oFBAxkib/SmZzp4xLisZIGlzpJQuAgRkwWA\n6BVMgRS+AaOMQ6wKPgz1x4v6T0cIELZEPq3piGxvvqkcLZKdCaeC3wCS6sxuafzZ\n4qA3zMwWuLOzRftgX2hQto7d/2YkRXga7jSvQl3id/EI+xrYoH6zIWgjdU1AUaNq\nNGT7DIo47vVMfnd9HFZNhREsd4GJE83I+JhTqIxiKPNxrKgESzyADmNPt0gXDnHo\ntbV1pMZz5HpJtjnP/qVZhEK5oB0tqlKPv9yx074=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICuTCCAj6gAwIBAgIRAKp1Rn3aL/g/6oiHVIXtCq8wCgYIKoZIzj0EAwMwgZsx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE0MDIGA1UEAwwrQW1h\nem9uIFJEUyBhcC1ub3J0aGVhc3QtMyBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UE\nBwwHU2VhdHRsZTAgFw0yMTA1MjQyMDMyMTdaGA8yMTIxMDUyNDIxMzIxN1owgZsx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE0MDIGA1UEAwwrQW1h\nem9uIFJEUyBhcC1ub3J0aGVhc3QtMyBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UE\nBwwHU2VhdHRsZTB2MBAGByqGSM49AgEGBSuBBAAiA2IABGTYWPILeBJXfcL3Dz4z\nEWMUq78xB1HpjBwHoTURYfcMd5r96BTVG6yaUBWnAVCMeeD6yTG9a1eVGNhG14Hk\nZAEjgLiNB7RRbEG5JZ/XV7W/vODh09WCst2y9SLKsdgeAaNCMEAwDwYDVR0TAQH/\nBAUwAwEB/zAdBgNVHQ4EFgQUoE0qZHmDCDB+Bnm8GUa/evpfPwgwDgYDVR0PAQH/\nBAQDAgGGMAoGCCqGSM49BAMDA2kAMGYCMQCnil5MMwhY3qoXv0xvcKZGxGPaBV15\n0CCssCKn0oVtdJQfJQ3Jrf3RSaEyijXIJsoCMQC35iJi4cWoNX3N/qfgnHohW52O\nB5dg0DYMqy5cNZ40+UcAanRMyqNQ6P7fy3umGco=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICtzCCAj2gAwIBAgIQPXnDTPegvJrI98qz8WxrMjAKBggqhkjOPQQDAzCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIEJldGEgdXMtZWFzdC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUxODIxNDAxMloYDzIxMjEwNTE4MjI0MDEyWjCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIEJldGEgdXMtZWFzdC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEI0sR7gwutK5AB46hM761\ngcLTGBIYlURSEoM1jcBwy56CL+3CJKZwLLyJ7qoOKfWbu5GsVLUTWS8MV6Nw33cx\n2KQD2svb694wi+Px2f4n9+XHkEFQw8BbiodDD7RZA70fo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBTQSioOvnVLEMXwNSDg+zgln/vAkjAOBgNVHQ8BAf8E\nBAMCAYYwCgYIKoZIzj0EAwMDaAAwZQIxAMwu1hqm5Bc98uE/E0B5iMYbBQ4kpMxO\ntP8FTfz5UR37HUn26nXE0puj6S/Ffj4oJgIwXI7s2c26tFQeqzq6u3lrNJHp5jC9\nUxlo/hEJOLoDj5jnpxo8dMAtCNoQPaHdfL0P\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrjCCAjWgAwIBAgIQGKVv+5VuzEZEBzJ+bVfx2zAKBggqhkjOPQQDAzCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGFwLXNvdXRoLTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTE5MTc1MDU5WhgPMjEyMTA1MTkxODUwNTlaMIGXMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpvbiBS\nRFMgYXAtc291dGgtMSBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwHU2VhdHRs\nZTB2MBAGByqGSM49AgEGBSuBBAAiA2IABMqdLJ0tZF/DGFZTKZDrGRJZID8ivC2I\nJRCYTWweZKCKSCAzoiuGGHzJhr5RlLHQf/QgmFcgXsdmO2n3CggzhA4tOD9Ip7Lk\nP05eHd2UPInyPCHRgmGjGb0Z+RdQ6zkitKNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd\nBgNVHQ4EFgQUC1yhRgVqU5bR8cGzOUCIxRpl4EYwDgYDVR0PAQH/BAQDAgGGMAoG\nCCqGSM49BAMDA2cAMGQCMG0c/zLGECRPzGKJvYCkpFTCUvdP4J74YP0v/dPvKojL\nt/BrR1Tg4xlfhaib7hPc7wIwFvgqHes20CubQnZmswbTKLUrgSUW4/lcKFpouFd2\nt2/ewfi/0VhkeUW+IiHhOMdU\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIGCTCCA/GgAwIBAgIRAOXxJuyXVkbfhZCkS/dOpfEwDQYJKoZIhvcNAQEMBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1ub3J0aGVhc3QtMSBSb290IENBIFJTQTQwOTYgRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTI1MjE1OTEwWhgPMjEyMTA1MjUyMjU5MTBa\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtbm9ydGhlYXN0LTEgUm9vdCBDQSBSU0E0MDk2IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA\nxiP4RDYm4tIS12hGgn1csfO8onQDmK5SZDswUpl0HIKXOUVVWkHNlINkVxbdqpqH\nFhbyZmNN6F/EWopotMDKe1B+NLrjNQf4zefv2vyKvPHJXhxoKmfyuTd5Wk8k1F7I\nlNwLQzznB+ElhrLIDJl9Ro8t31YBBNFRGAGEnxyACFGcdkjlsa52UwfYrwreEg2l\ngW5AzqHgjFfj9QRLydeU/n4bHm0F1adMsV7P3rVwilcUlqsENDwXnWyPEyv3sw6F\nwNemLEs1129mB77fwvySb+lLNGsnzr8w4wdioZ74co+T9z2ca+eUiP+EQccVw1Is\nD4Fh57IjPa6Wuc4mwiUYKkKY63+38aCfEWb0Qoi+zW+mE9nek6MOQ914cN12u5LX\ndBoYopphRO5YmubSN4xcBy405nIdSdbrAVWwxXnVVyjqjknmNeqQsPZaxAhdoKhV\nAqxNr8AUAdOAO6Sz3MslmcLlDXFihrEEOeUbpg/m1mSUUHGbu966ajTG1FuEHHwS\n7WB52yxoJo/tHvt9nAWnh3uH5BHmS8zn6s6CGweWKbX5yICnZ1QFR1e4pogxX39v\nXD6YcNOO+Vn+HY4nXmjgSYVC7l+eeP8eduMg1xJujzjrbmrXU+d+cBObgdTOAlpa\nJFHaGwYw1osAwPCo9cZ2f04yitBfj9aPFia8ASKldakCAwEAAaNCMEAwDwYDVR0T\nAQH/BAUwAwEB/zAdBgNVHQ4EFgQUqKS+ltlior0SyZKYAkJ/efv55towDgYDVR0P\nAQH/BAQDAgGGMA0GCSqGSIb3DQEBDAUAA4ICAQAdElvp8bW4B+Cv+1WSN87dg6TN\nwGyIjJ14/QYURgyrZiYpUmZpj+/pJmprSWXu4KNyqHftmaidu7cdjL5nCAvAfnY5\n/6eDDbX4j8Gt9fb/6H9y0O0dn3mUPSEKG0crR+JRFAtPhn/2FNvst2P82yguWLv0\npHjHVUVcq+HqDMtUIJsTPYjSh9Iy77Q6TOZKln9dyDOWJpCSkiUWQtMAKbCSlvzd\nzTs/ahqpT+zLfGR1SR+T3snZHgQnbnemmz/XtlKl52NxccARwfcEEKaCRQyGq/pR\n0PVZasyJS9JY4JfQs4YOdeOt4UMZ8BmW1+BQWGSkkb0QIRl8CszoKofucAlqdPcO\nIT/ZaMVhI580LFGWiQIizWFskX6lqbCyHqJB3LDl8gJISB5vNTHOHpvpMOMs5PYt\ncRl5Mrksx5MKMqG7y5R734nMlZxQIHjL5FOoOxTBp9KeWIL/Ib89T2QDaLw1SQ+w\nihqWBJ4ZdrIMWYpP3WqM+MXWk7WAem+xsFJdR+MDgOOuobVQTy5dGBlPks/6gpjm\nrO9TjfQ36ppJ3b7LdKUPeRfnYmlR5RU4oyYJ//uLbClI443RZAgxaCXX/nyc12lr\neVLUMNF2abLX4/VF63m2/Z9ACgMRfqGshPssn1NN33OonrotQoj4S3N9ZrjvzKt8\niHcaqd60QKpfiH2A3A==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICuDCCAj2gAwIBAgIQPaVGRuu86nh/ylZVCLB0MzAKBggqhkjOPQQDAzCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLW5vcnRoZWFzdC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyNTIyMDMxNloYDzIxMjEwNTI1MjMwMzE2WjCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLW5vcnRoZWFzdC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEexNURoB9KE93MEtEAlJG\nobz4LS/pD2hc8Gczix1WhVvpJ8bN5zCDXaKdnDMCebetyRQsmQ2LYlfmCwpZwSDu\n0zowB11Pt3I5Avu2EEcuKTlKIDMBeZ1WWuOd3Tf7MEAMo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBSaYbZPBvFLikSAjpa8mRJvyArMxzAOBgNVHQ8BAf8E\nBAMCAYYwCgYIKoZIzj0EAwMDaQAwZgIxAOEJkuh3Zjb7Ih/zuNRd1RBqmIYcnyw0\nnwUZczKXry+9XebYj3VQxSRNadrarPWVqgIxAMg1dyGoDAYjY/L/9YElyMnvHltO\nPwpJShmqHvCLc/mXMgjjYb/akK7yGthvW6j/uQ==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIGCDCCA/CgAwIBAgIQChu3v5W1Doil3v6pgRIcVzANBgkqhkiG9w0BAQwFADCB\nnDELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTUwMwYDVQQDDCxB\nbWF6b24gUkRTIEJldGEgdXMtZWFzdC0xIFJvb3QgQ0EgUlNBNDA5NiBHMTEQMA4G\nA1UEBwwHU2VhdHRsZTAgFw0yMTA1MTgyMTM0MTVaGA8yMTIxMDUxODIyMzQxNVow\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBCZXRhIHVzLWVhc3QtMSBSb290IENBIFJTQTQwOTYgRzExEDAO\nBgNVBAcMB1NlYXR0bGUwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQC1\nFUGQ5tf3OwpDR6hGBxhUcrkwKZhaXP+1St1lSOQvjG8wXT3RkKzRGMvb7Ee0kzqI\nmzKKe4ASIhtV3UUWdlNmP0EA3XKnif6N79MismTeGkDj75Yzp5A6tSvqByCgxIjK\nJqpJrch3Dszoyn8+XhwDxMZtkUa5nQVdJgPzJ6ltsQ8E4SWLyLtTu0S63jJDkqYY\nS7cQblk7y7fel+Vn+LS5dGTdRRhMvSzEnb6mkVBaVzRyVX90FNUED06e8q+gU8Ob\nhtvQlf9/kRzHwRAdls2YBhH40ZeyhpUC7vdtPwlmIyvW5CZ/QiG0yglixnL6xahL\npbmTuTSA/Oqz4UGQZv2WzHe1lD2gRHhtFX2poQZeNQX8wO9IcUhrH5XurW/G9Xwl\nSat9CMPERQn4KC3HSkat4ir2xaEUrjfg6c4XsGyh2Pk/LZ0gLKum0dyWYpWP4JmM\nRQNjrInXPbMhzQObozCyFT7jYegS/3cppdyy+K1K7434wzQGLU1gYXDKFnXwkX8R\nbRKgx2pHNbH5lUddjnNt75+e8m83ygSq/ZNBUz2Ur6W2s0pl6aBjwaDES4VfWYlI\njokcmrGvJNDfQWygb1k00eF2bzNeNCHwgWsuo3HSxVgc/WGsbcGrTlDKfz+g3ich\nbXUeUidPhRiv5UQIVCLIHpHuin3bj9lQO/0t6p+tAQIDAQABo0IwQDAPBgNVHRMB\nAf8EBTADAQH/MB0GA1UdDgQWBBSFmMBgm5IsRv3hLrvDPIhcPweXYTAOBgNVHQ8B\nAf8EBAMCAYYwDQYJKoZIhvcNAQEMBQADggIBAAa2EuozymOsQDJlEi7TqnyA2OhT\nGXPfYqCyMJVkfrqNgcnsNpCAiNEiZbb+8sIPXnT8Ay8hrwJYEObJ5b7MHXpLuyft\nz0Pu1oFLKnQxKjNxrIsCvaB4CRRdYjm1q7EqGhMGv76se9stOxkOqO9it31w/LoU\nENDk7GLsSqsV1OzYLhaH8t+MaNP6rZTSNuPrHwbV3CtBFl2TAZ7iKgKOhdFz1Hh9\nPez0lG+oKi4mHZ7ajov6PD0W7njn5KqzCAkJR6OYmlNVPjir+c/vUtEs0j+owsMl\ng7KE5g4ZpTRShyh5BjCFRK2tv0tkqafzNtxrKC5XNpEkqqVTCnLcKG+OplIEadtr\nC7UWf4HyhCiR+xIyxFyR05p3uY/QQU/5uza7GlK0J+U1sBUytx7BZ+Fo8KQfPPqV\nCqDCaYUksoJcnJE/KeoksyqNQys7sDGJhkd0NeUGDrFLKHSLhIwAMbEWnqGxvhli\nE7sP2E5rI/I9Y9zTbLIiI8pfeZlFF8DBdoP/Hzg8pqsiE/yiXSFTKByDwKzGwNqz\nF0VoFdIZcIbLdDbzlQitgGpJtvEL7HseB0WH7B2PMMD8KPJlYvPveO3/6OLzCsav\n+CAkvk47NQViKMsUTKOA0JDCW+u981YRozxa3K081snhSiSe83zIPBz1ikldXxO9\n6YYLNPRrj3mi9T/f\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrjCCAjSgAwIBAgIRAMkvdFnVDb0mWWFiXqnKH68wCgYIKoZIzj0EAwMwgZYx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEvMC0GA1UEAwwmQW1h\nem9uIFJEUyB1cy13ZXN0LTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTE5MTkxMzI0WhgPMjEyMTA1MTkyMDEzMjRaMIGWMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExLzAtBgNVBAMMJkFtYXpvbiBS\nRFMgdXMtd2VzdC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdTZWF0dGxl\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEy86DB+9th/0A5VcWqMSWDxIUblWTt/R0\nao6Z2l3vf2YDF2wt1A2NIOGpfQ5+WAOJO/IQmnV9LhYo+kacB8sOnXdQa6biZZkR\nIyouUfikVQAKWEJnh1Cuo5YMM4E2sUt5o0IwQDAPBgNVHRMBAf8EBTADAQH/MB0G\nA1UdDgQWBBQ8u3OnecANmG8OoT7KLWDuFzZwBTAOBgNVHQ8BAf8EBAMCAYYwCgYI\nKoZIzj0EAwMDaAAwZQIwQ817qkb7mWJFnieRAN+m9W3E0FLVKaV3zC5aYJUk2fcZ\nTaUx3oLp3jPLGvY5+wgeAjEA6wAicAki4ZiDfxvAIuYiIe1OS/7H5RA++R8BH6qG\niRzUBM/FItFpnkus7u/eTkvo\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrzCCAjWgAwIBAgIQS/+Ryfgb/IOVEa1pWoe8oTAKBggqhkjOPQQDAzCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGFwLXNvdXRoLTIgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjIwNjA2MjE1NDQyWhgPMjEyMjA2MDYyMjU0NDJaMIGXMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpvbiBS\nRFMgYXAtc291dGgtMiBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwHU2VhdHRs\nZTB2MBAGByqGSM49AgEGBSuBBAAiA2IABDsX6fhdUWBQpYTdseBD/P3s96Dtw2Iw\nOrXKNToCnmX5nMkUGdRn9qKNiz1pw3EPzaPxShbYwQ7LYP09ENK/JN4QQjxMihxC\njLFxS85nhBQQQGRCWikDAe38mD8fSvREQKNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd\nBgNVHQ4EFgQUIh1xZiseQYFjPYKJmGbruAgRH+AwDgYDVR0PAQH/BAQDAgGGMAoG\nCCqGSM49BAMDA2gAMGUCMFudS4zLy+UUGrtgNLtRMcu/DZ9BUzV4NdHxo0bkG44O\nthnjl4+wTKI6VbyAbj2rkgIxAOHps8NMITU5DpyiMnKTxV8ubb/WGHrLl0BjB8Lw\nETVJk5DNuZvsIIcm7ykk6iL4Tw==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIGBDCCA+ygAwIBAgIQDcEmNIAVrDpUw5cH5ynutDANBgkqhkiG9w0BAQwFADCB\nmjELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTMwMQYDVQQDDCpB\nbWF6b24gUkRTIG1lLWNlbnRyYWwtMSBSb290IENBIFJTQTQwOTYgRzExEDAOBgNV\nBAcMB1NlYXR0bGUwIBcNMjIwNTA3MDA0MDIzWhgPMjEyMjA1MDcwMTQwMjNaMIGa\nMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5j\nLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMzAxBgNVBAMMKkFt\nYXpvbiBSRFMgbWUtY2VudHJhbC0xIFJvb3QgQ0EgUlNBNDA5NiBHMTEQMA4GA1UE\nBwwHU2VhdHRsZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAKvADk8t\nFl9bFlU5sajLPPDSOUpPAkKs6iPlz+27o1GJC88THcOvf3x0nVAcu9WYe9Qaas+4\nj4a0vv51agqyODRD/SNi2HnqW7DbtLPAm6KBHe4twl28ItB/JD5g7u1oPAHFoXMS\ncH1CZEAs5RtlZGzJhcBXLFsHNv/7+SCLyZ7+2XFh9OrtgU4wMzkHoRNndhfwV5bu\n17bPTwuH+VxH37zXf1mQ/KjhuJos0C9dL0FpjYBAuyZTAWhZKs8dpSe4DI544z4w\ngkwUB4bC2nA1TBzsywEAHyNuZ/xRjNpWvx0ToWAA2iFJqC3VO3iKcnBplMvaUuMt\njwzVSNBnKcoabXCZL2XDLt4YTZR8FSwz05IvsmwcPB7uNTBXq3T9sjejW8QQK3vT\ntzyfLq4jKmQE7PoS6cqYm+hEPm2hDaC/WP9bp3FdEJxZlPH26fq1b7BWYWhQ9pBA\nNv9zTnzdR1xohTyOJBUFQ81ybEzabqXqVXUIANqIOaNcTB09/sLJ7+zuMhp3mwBu\nLtjfJv8PLuT1r63bU3seROhKA98b5KfzjvbvPSg3vws78JQyoYGbqNyDfyjVjg3U\nv//AdVuPie6PNtdrW3upZY4Qti5IjP9e3kimaJ+KAtTgMRG56W0WxD3SP7+YGGbG\nKhntDOkKsN39hLpn9UOafTIqFu7kIaueEy/NAgMBAAGjQjBAMA8GA1UdEwEB/wQF\nMAMBAf8wHQYDVR0OBBYEFHAems86dTwdZbLe8AaPy3kfIUVoMA4GA1UdDwEB/wQE\nAwIBhjANBgkqhkiG9w0BAQwFAAOCAgEAOBHpp0ICx81kmeoBcZTrMdJs2gnhcd85\nFoSCjXx9H5XE5rmN/lQcxxOgj8hr3uPuLdLHu+i6THAyzjrl2NA1FWiqpfeECGmy\n0jm7iZsYORgGQYp/VKnDrwnKNSqlZvOuRr0kfUexwFlr34Y4VmupvEOK/RdGsd3S\n+3hiemcHse9ST/sJLHx962AWMkN86UHPscJEe4+eT3f2Wyzg6La8ARwdWZSNS+WH\nZfybrncMmuiXuUdHv9XspPsqhKgtHhcYeXOGUtrwQPLe3+VJZ0LVxhlTWr9951GZ\nGfmWwTV/9VsyKVaCFIXeQ6L+gjcKyEzYF8wpMtQlSc7FFqwgC4bKxvMBSaRy88Nr\nlV2+tJD/fr8zGUeBK44Emon0HKDBWGX+/Hq1ZIv0Da0S+j6LbA4fusWxtGfuGha+\nluhHgVInCpALIOamiBEdGhILkoTtx7JrYppt3/Raqg9gUNCOOYlCvGhqX7DXeEfL\nDGabooiY2FNWot6h04JE9nqGj5QqT8D6t/TL1nzxhRPzbcSDIHUd/b5R+a0bAA+7\nYTU6JqzEVCWKEIEynYmqikgLMGB/OzWsgyEL6822QW6hJAQ78XpbNeCzrICF4+GC\n7KShLnwuWoWpAb26268lvOEvCTFM47VC6jNQl97md+2SA9Ma81C9wflid2M83Wle\ncuLMVcQZceE=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEADCCAuigAwIBAgIQAhAteLRCvizAElaWORFU2zANBgkqhkiG9w0BAQsFADCB\nmDELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChB\nbWF6b24gUkRTIG1lLXNvdXRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyMDE3MDkxNloYDzIwNjEwNTIwMTgwOTE2WjCBmDEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChBbWF6\nb24gUkRTIG1lLXNvdXRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA+qg7JAcOVKjh\nN83SACnBFZPyB63EusfDr/0V9ZdL8lKcmZX9sv/CqoBo3N0EvBqHQqUUX6JvFb7F\nXrMUZ740kr28gSRALfXTFgNODjXeDsCtEkKRTkac/UM8xXHn+hR7UFRPHS3e0GzI\niLiwQWDkr0Op74W8aM0CfaVKvh2bp4BI1jJbdDnQ9OKXpOxNHGUf0ZGb7TkNPkgI\nb2CBAc8J5o3H9lfw4uiyvl6Fz5JoP+A+zPELAioYBXDrbE7wJeqQDJrETWqR9VEK\nBXURCkVnHeaJy123MpAX2ozf4pqk0V0LOEOZRS29I+USF5DcWr7QIXR/w2I8ws1Q\n7ys+qbE+kQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQFJ16n\n1EcCMOIhoZs/F9sR+Jy++zAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZIhvcNAQELBQAD\nggEBAOc5nXbT3XTDEZsxX2iD15YrQvmL5m13B3ImZWpx/pqmObsgx3/dg75rF2nQ\nqS+Vl+f/HLh516pj2BPP/yWCq12TRYigGav8UH0qdT3CAClYy2o+zAzUJHm84oiB\nud+6pFVGkbqpsY+QMpJUbZWu52KViBpJMYsUEy+9cnPSFRVuRAHjYynSiLk2ZEjb\nWkdc4x0nOZR5tP0FgrX0Ve2KcjFwVQJVZLgOUqmFYQ/G0TIIGTNh9tcmR7yp+xJR\nA2tbPV2Z6m9Yxx4E8lLEPNuoeouJ/GR4CkMEmF8cLwM310t174o3lKKUXJ4Vs2HO\nWj2uN6R9oI+jGLMSswTzCNV1vgc=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICuDCCAj6gAwIBAgIRAOocLeZWjYkG/EbHmscuy8gwCgYIKoZIzj0EAwMwgZsx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE0MDIGA1UEAwwrQW1h\nem9uIFJEUyBhcC1zb3V0aGVhc3QtMSBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UE\nBwwHU2VhdHRsZTAgFw0yMTA1MjEyMTUwMDFaGA8yMTIxMDUyMTIyNTAwMVowgZsx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE0MDIGA1UEAwwrQW1h\nem9uIFJEUyBhcC1zb3V0aGVhc3QtMSBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UE\nBwwHU2VhdHRsZTB2MBAGByqGSM49AgEGBSuBBAAiA2IABCEr3jq1KtRncnZfK5cq\nbtY0nW6ZG3FMbh7XwBIR6Ca0f8llGZ4vJEC1pXgiM/4Dh045B9ZIzNrR54rYOIfa\n2NcYZ7mk06DjIQML64hbAxbQzOAuNzLPx268MrlL2uW2XaNCMEAwDwYDVR0TAQH/\nBAUwAwEB/zAdBgNVHQ4EFgQUln75pChychwN4RfHl+tOinMrfVowDgYDVR0PAQH/\nBAQDAgGGMAoGCCqGSM49BAMDA2gAMGUCMGiyPINRU1mwZ4Crw01vpuPvxZxb2IOr\nyX3RNlOIu4We1H+5dQk5tIvH8KGYFbWEpAIxAO9NZ6/j9osMhLgZ0yj0WVjb+uZx\nYlZR9fyFisY/jNfX7QhSk+nrc3SFLRUNtpXrng==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBTCCAu2gAwIBAgIRAKiaRZatN8eiz9p0s0lu0rQwDQYJKoZIhvcNAQELBQAw\ngZoxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEzMDEGA1UEAwwq\nQW1hem9uIFJEUyBjYS1jZW50cmFsLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYD\nVQQHDAdTZWF0dGxlMCAXDTIxMDUyMTIyMDIzNVoYDzIwNjEwNTIxMjMwMjM1WjCB\nmjELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTMwMQYDVQQDDCpB\nbWF6b24gUkRTIGNhLWNlbnRyYWwtMSBSb290IENBIFJTQTIwNDggRzExEDAOBgNV\nBAcMB1NlYXR0bGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCygVMf\nqB865IR9qYRBRFHn4eAqGJOCFx+UbraQZmjr/mnRqSkY+nhbM7Pn/DWOrRnxoh+w\nq5F9ZxdZ5D5T1v6kljVwxyfFgHItyyyIL0YS7e2h7cRRscCM+75kMedAP7icb4YN\nLfWBqfKHbHIOqvvQK8T6+Emu/QlG2B5LvuErrop9K0KinhITekpVIO4HCN61cuOe\nCADBKF/5uUJHwS9pWw3uUbpGUwsLBuhJzCY/OpJlDqC8Y9aToi2Ivl5u3/Q/sKjr\n6AZb9lx4q3J2z7tJDrm5MHYwV74elGSXoeoG8nODUqjgklIWAPrt6lQ3WJpO2kug\n8RhCdSbWkcXHfX95AgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYE\nFOIxhqTPkKVqKBZvMWtKewKWDvDBMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0B\nAQsFAAOCAQEAqoItII89lOl4TKvg0I1EinxafZLXIheLcdGCxpjRxlZ9QMQUN3yb\ny/8uFKBL0otbQgJEoGhxm4h0tp54g28M6TN1U0332dwkjYxUNwvzrMaV5Na55I2Z\n1hq4GB3NMXW+PvdtsgVOZbEN+zOyOZ5MvJHEQVkT3YRnf6avsdntltcRzHJ16pJc\nY8rR7yWwPXh1lPaPkxddrCtwayyGxNbNmRybjR48uHRhwu7v2WuAMdChL8H8bp89\nTQLMrMHgSbZfee9hKhO4Zebelf1/cslRSrhkG0ESq6G5MUINj6lMg2g6F0F7Xz2v\nncD/vuRN5P+vT8th/oZ0Q2Gc68Pun0cn/g==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID/zCCAuegAwIBAgIRAJYlnmkGRj4ju/2jBQsnXJYwDQYJKoZIhvcNAQELBQAw\ngZcxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEwMC4GA1UEAwwn\nQW1hem9uIFJEUyB1cy1lYXN0LTIgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyMTIzMDQ0NFoYDzIwNjEwNTIyMDAwNDQ0WjCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIHVzLWVhc3QtMiBSb290IENBIFJTQTIwNDggRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC74V3eigv+pCj5\nnqDBqplY0Jp16pTeNB06IKbzb4MOTvNde6QjsZxrE1xUmprT8LxQqN9tI3aDYEYk\nb9v4F99WtQVgCv3Y34tYKX9NwWQgwS1vQwnIR8zOFBYqsAsHEkeJuSqAB12AYUSd\nZv2RVFjiFmYJho2X30IrSLQfS/IE3KV7fCyMMm154+/K1Z2IJlcissydEAwgsUHw\nedrE6CxJVkkJ3EvIgG4ugK/suxd8eEMztaQYJwSdN8TdfT59LFuSPl7zmF3fIBdJ\n//WexcQmGabaJ7Xnx+6o2HTfkP8Zzzzaq8fvjAcvA7gyFH5EP26G2ZqMG+0y4pTx\nSPVTrQEXAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFIWWuNEF\nsUMOC82XlfJeqazzrkPDMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0BAQsFAAOC\nAQEAgClmxcJaQTGpEZmjElL8G2Zc8lGc+ylGjiNlSIw8X25/bcLRptbDA90nuP+q\nzXAMhEf0ccbdpwxG/P5a8JipmHgqQLHfpkvaXx+0CuP++3k+chAJ3Gk5XtY587jX\n+MJfrPgjFt7vmMaKmynndf+NaIJAYczjhJj6xjPWmGrjM3MlTa9XesmelMwP3jep\nbApIWAvCYVjGndbK9byyMq1nyj0TUzB8oJZQooaR3MMjHTmADuVBylWzkRMxbKPl\n4Nlsk4Ef1JvIWBCzsMt+X17nuKfEatRfp3c9tbpGlAE/DSP0W2/Lnayxr4RpE9ds\nICF35uSis/7ZlsftODUe8wtpkQ==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nPqj2\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nKDPtFEk=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICtzCCAj2gAwIBAgIQVZ5Y/KqjR4XLou8MCD5pOjAKBggqhkjOPQQDAzCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLXNvdXRoZWFzdC00IFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIyMDUyNTE2NTgzM1oYDzIxMjIwNTI1MTc1ODMzWjCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLXNvdXRoZWFzdC00IFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEbo473OmpD5vkckdJajXg\nbrhmNFyoSa0WCY1njuZC2zMFp3zP6rX4I1r3imrYnJd9pFH/aSiV/r6L5ACE5RPx\n4qdg5SQ7JJUaZc3DWsTOiOed7BCZSzM+KTYK/2QzDMApo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBTmogc06+1knsej1ltKUOdWFvwgsjAOBgNVHQ8BAf8E\nBAMCAYYwCgYIKoZIzj0EAwMDaAAwZQIxAIs7TlLMbGTWNXpGiKf9DxaM07d/iDHe\nF/Vv/wyWSTGdobxBL6iArQNVXz0Gr4dvPAIwd0rsoa6R0x5mtvhdRPtM37FYrbHJ\npbV+OMusQqcSLseunLBoCHenvJW0QOCQ8EDY\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICvTCCAkOgAwIBAgIQCIY7E/bFvFN2lK9Kckb0dTAKBggqhkjOPQQDAzCBnjEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTcwNQYDVQQDDC5BbWF6\nb24gUkRTIFByZXZpZXcgdXMtZWFzdC0yIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYD\nVQQHDAdTZWF0dGxlMCAXDTIxMDUxODIxMDUxMFoYDzIxMjEwNTE4MjIwNTEwWjCB\nnjELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTcwNQYDVQQDDC5B\nbWF6b24gUkRTIFByZXZpZXcgdXMtZWFzdC0yIFJvb3QgQ0EgRUNDMzg0IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEMI0hzf1JCEOI\nEue4+DmcNnSs2i2UaJxHMrNGGfU7b42a7vwP53F7045ffHPBGP4jb9q02/bStZzd\nVHqfcgqkSRI7beBKjD2mfz82hF/wJSITTgCLs+NRpS6zKMFOFHUNo0IwQDAPBgNV\nHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS8uF/6hk5mPLH4qaWv9NVZaMmyTjAOBgNV\nHQ8BAf8EBAMCAYYwCgYIKoZIzj0EAwMDaAAwZQIxAO7Pu9wzLyM0X7Q08uLIL+vL\nqaxe3UFuzFTWjM16MLJHbzLf1i9IDFKz+Q4hXCSiJwIwClMBsqT49BPUxVsJnjGr\nEbyEk6aOOVfY1p2yQL649zh3M4h8okLnwf+bYIb1YpeU\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEADCCAuigAwIBAgIQY+JhwFEQTe36qyRlUlF8ozANBgkqhkiG9w0BAQsFADCB\nmDELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChB\nbWF6b24gUkRTIGFmLXNvdXRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUxOTE5MjQxNloYDzIwNjEwNTE5MjAyNDE2WjCBmDEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChBbWF6\nb24gUkRTIGFmLXNvdXRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnIye77j6ev40\n8wRPyN2OdKFSUfI9jB20Or2RLO+RDoL43+USXdrze0Wv4HMRLqaen9BcmCfaKMp0\nE4SFo47bXK/O17r6G8eyq1sqnHE+v288mWtYH9lAlSamNFRF6YwA7zncmE/iKL8J\n0vePHMHP/B6svw8LULZCk+nZk3tgxQn2+r0B4FOz+RmpkoVddfqqUPMbKUxhM2wf\nfO7F6bJaUXDNMBPhCn/3ayKCjYr49ErmnpYV2ZVs1i34S+LFq39J7kyv6zAgbHv9\n+/MtRMoRB1CjpqW0jIOZkHBdYcd1o9p1zFn591Do1wPkmMsWdjIYj+6e7UXcHvOB\n2+ScIRAcnwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQGtq2W\nYSyMMxpdQ3IZvcGE+nyZqTAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZIhvcNAQELBQAD\nggEBAEgoP3ixJsKSD5FN8dQ01RNHERl/IFbA7TRXfwC+L1yFocKnQh4Mp/msPRSV\n+OeHIvemPW/wtZDJzLTOFJ6eTolGekHK1GRTQ6ZqsWiU2fmiOP8ks4oSpI+tQ9Lw\nVrfZqTiEcS5wEIqyfUAZZfKDo7W1xp+dQWzfczSBuZJZwI5iaha7+ILM0r8Ckden\nTVTapc5pLSoO15v0ziRuQ2bT3V3nwu/U0MRK44z+VWOJdSiKxdnOYDs8hFNnKhfe\nklbTZF7kW7WbiNYB43OaAQBJ6BALZsIskEaqfeZT8FD71uN928TcEQyBDXdZpRN+\niGQZDGhht0r0URGMDSs9waJtTfA=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIF/jCCA+agAwIBAgIQXY/dmS+72lZPranO2JM9jjANBgkqhkiG9w0BAQwFADCB\nlzELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdB\nbWF6b24gUkRTIGFwLWVhc3QtMSBSb290IENBIFJTQTQwOTYgRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjEwNTI1MjEzNDUxWhgPMjEyMTA1MjUyMjM0NTFaMIGXMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpv\nbiBSRFMgYXAtZWFzdC0xIFJvb3QgQ0EgUlNBNDA5NiBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMyW9kBJjD/hx8e8\nb5E1sF42bp8TXsz1htSYE3Tl3T1Aq379DfEhB+xa/ASDZxt7/vwa81BkNo4M6HYq\nokYIXeE7cu5SnSgjWXqcERhgPevtAwgmhdE3yREe8oz2DyOi2qKKZqah+1gpPaIQ\nfK0uAqoeQlyHosye3KZZKkDHBatjBsQ5kf8lhuf7wVulEZVRHY2bP2X7N98PfbpL\nQdH7mWXzDtJJ0LiwFwds47BrkgK1pkHx2p1mTo+HMkfX0P6Fq1atkVC2RHHtbB/X\niYyH7paaHBzviFrhr679zNqwXIOKlbf74w3mS11P76rFn9rS1BAH2Qm6eY5S/Fxe\nHEKXm4kjPN63Zy0p3yE5EjPt54yPkvumOnT+RqDGJ2HCI9k8Ehcbve0ogfdRKNqQ\nVHWYTy8V33ndQRHZlx/CuU1yN61TH4WSoMly1+q1ihTX9sApmlQ14B2pJi/9DnKW\ncwECrPy1jAowC2UJ45RtC8UC05CbP9yrIy/7Noj8gQDiDOepm+6w1g6aNlWoiuQS\nkyI6nzz1983GcnOHya73ga7otXo0Qfg9jPghlYiMomrgshlSLDHZG0Ib/3hb8cnR\n1OcN9FpzNmVK2Ll1SmTMLrIhuCkyNYX9O/bOknbcf706XeESxGduSkHEjIw/k1+2\nAtteoq5dT6cwjnJ9hyhiueVlVkiDAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8w\nHQYDVR0OBBYEFLUI+DD7RJs+0nRnjcwIVWzzYSsFMA4GA1UdDwEB/wQEAwIBhjAN\nBgkqhkiG9w0BAQwFAAOCAgEAb1mcCHv4qMQetLGTBH9IxsB2YUUhr5dda0D2BcHr\nUtDbfd0VQs4tux6h/6iKwHPx0Ew8fuuYj99WknG0ffgJfNc5/fMspxR/pc1jpdyU\n5zMQ+B9wi0lOZPO9uH7/pr+d2odcNEy8zAwqdv/ihsTwLmGP54is9fVbsgzNW1cm\nHKAVL2t/Ope+3QnRiRilKCN1lzhav4HHdLlN401TcWRWKbEuxF/FgxSO2Hmx86pj\ne726lweCTMmnq/cTsPOVY0WMjs0or3eHDVlyLgVeV5ldyN+ptg3Oit60T05SRa58\nAJPTaVKIcGQ/gKkKZConpu7GDofT67P/ox0YNY57LRbhsx9r5UY4ROgz7WMQ1yoS\nY+19xizm+mBm2PyjMUbfwZUyCxsdKMwVdOq5/UmTmdms+TR8+m1uBHPOTQ2vKR0s\nPd/THSzPuu+d3dbzRyDSLQbHFFneG760CUlD/ZmzFlQjJ89/HmAmz8IyENq+Sjhx\nJgzy+FjVZb8aRUoYLlnffpUpej1n87Ynlr1GrvC4GsRpNpOHlwuf6WD4W0qUTsC/\nC9JO+fBzUj/aWlJzNcLEW6pte1SB+EdkR2sZvWH+F88TxemeDrV0jKJw5R89CDf8\nZQNfkxJYjhns+YeV0moYjqQdc7tq4i04uggEQEtVzEhRLU5PE83nlh/K2NZZm8Kj\ndIA=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID/zCCAuegAwIBAgIRAPVSMfFitmM5PhmbaOFoGfUwDQYJKoZIhvcNAQELBQAw\ngZcxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEwMC4GA1UEAwwn\nQW1hem9uIFJEUyB1cy1lYXN0LTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyNTIyMzQ1N1oYDzIwNjEwNTI1MjMzNDU3WjCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIHVzLWVhc3QtMSBSb290IENBIFJTQTIwNDggRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDu9H7TBeGoDzMr\ndxN6H8COntJX4IR6dbyhnj5qMD4xl/IWvp50lt0VpmMd+z2PNZzx8RazeGC5IniV\n5nrLg0AKWRQ2A/lGGXbUrGXCSe09brMQCxWBSIYe1WZZ1iU1IJ/6Bp4D2YEHpXrW\nbPkOq5x3YPcsoitgm1Xh8ygz6vb7PsvJvPbvRMnkDg5IqEThapPjmKb8ZJWyEFEE\nQRrkCIRueB1EqQtJw0fvP4PKDlCJAKBEs/y049FoOqYpT3pRy0WKqPhWve+hScMd\n6obq8kxTFy1IHACjHc51nrGII5Bt76/MpTWhnJIJrCnq1/Uc3Qs8IVeb+sLaFC8K\nDI69Sw6bAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFE7PCopt\nlyOgtXX0Y1lObBUxuKaCMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0BAQsFAAOC\nAQEAFj+bX8gLmMNefr5jRJfHjrL3iuZCjf7YEZgn89pS4z8408mjj9z6Q5D1H7yS\njNETVV8QaJip1qyhh5gRzRaArgGAYvi2/r0zPsy+Tgf7v1KGL5Lh8NT8iCEGGXwF\ng3Ir+Nl3e+9XUp0eyyzBIjHtjLBm6yy8rGk9p6OtFDQnKF5OxwbAgip42CD75r/q\np421maEDDvvRFR4D+99JZxgAYDBGqRRceUoe16qDzbMvlz0A9paCZFclxeftAxv6\nQlR5rItMz/XdzpBJUpYhdzM0gCzAzdQuVO5tjJxmXhkSMcDP+8Q+Uv6FA9k2VpUV\nE/O5jgpqUJJ2Hc/5rs9VkAPXeA==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrzCCAjWgAwIBAgIQW0yuFCle3uj4vWiGU0SaGzAKBggqhkjOPQQDAzCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGFmLXNvdXRoLTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTE5MTkzNTE2WhgPMjEyMTA1MTkyMDM1MTZaMIGXMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpvbiBS\nRFMgYWYtc291dGgtMSBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwHU2VhdHRs\nZTB2MBAGByqGSM49AgEGBSuBBAAiA2IABDPiKNZSaXs3Un/J/v+LTsFDANHpi7en\noL2qh0u0DoqNzEBTbBjvO23bLN3k599zh6CY3HKW0r2k1yaIdbWqt4upMCRCcUFi\nI4iedAmubgzh56wJdoMZztjXZRwDthTkJKNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd\nBgNVHQ4EFgQUWbYkcrvVSnAWPR5PJhIzppcAnZIwDgYDVR0PAQH/BAQDAgGGMAoG\nCCqGSM49BAMDA2gAMGUCMCESGqpat93CjrSEjE7z+Hbvz0psZTHwqaxuiH64GKUm\nmYynIiwpKHyBrzjKBmeDoQIxANGrjIo6/b8Jl6sdIZQI18V0pAyLfLiZjlHVOnhM\nMOTVgr82ZuPoEHTX78MxeMnYlw==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgIRAIbsx8XOl0sgTNiCN4O+18QwDQYJKoZIhvcNAQELBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1ub3J0aGVhc3QtMSBSb290IENBIFJTQTIwNDggRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTI1MjE1NDU4WhgPMjA2MTA1MjUyMjU0NTha\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtbm9ydGhlYXN0LTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\ntROxwXWCgn5R9gI/2Ivjzaxc0g95ysBjoJsnhPdJEHQb7w3y2kWrVWU3Y9fOitgb\nCEsnEC3PrhRnzNVW0fPsK6kbvOeCmjvY30rdbxbc8h+bjXfGmIOgAkmoULEr6Hc7\nG1Q/+tvv4lEwIs7bEaf+abSZxRJbZ0MBxhbHn7UHHDiMZYvzK+SV1MGCxx7JVhrm\nxWu3GC1zZCsGDhB9YqY9eR6PmjbqA5wy8vqbC57dZZa1QVtWIQn3JaRXn+faIzHx\nnLMN5CEWihsdmHBXhnRboXprE/OS4MFv1UrQF/XM/h5RBeCywpHePpC+Oe1T3LNC\niP8KzRFrjC1MX/WXJnmOVQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\nDgQWBBS33XbXAUMs1znyZo4B0+B3D68WFTAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZI\nhvcNAQELBQADggEBADuadd2EmlpueY2VlrIIPC30QkoA1EOSoCmZgN6124apkoY1\nHiV4r+QNPljN4WP8gmcARnNkS7ZeR4fvWi8xPh5AxQCpiaBMw4gcbTMCuKDV68Pw\nP2dZCTMspvR3CDfM35oXCufdtFnxyU6PAyINUqF/wyTHguO3owRFPz64+sk3r2pT\nWHmJjG9E7V+KOh0s6REgD17Gqn6C5ijLchSrPUHB0wOIkeLJZndHxN/76h7+zhMt\nfFeNxPWHY2MfpcaLjz4UREzZPSB2U9k+y3pW1omCIcl6MQU9itGx/LpQE+H3ZeX2\nM2bdYd5L+ow+bdbGtsVKOuN+R9Dm17YpswF+vyQ=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nEm4Hy3A=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIGBTCCA+2gAwIBAgIRAJfKe4Zh4aWNt3bv6ZjQwogwDQYJKoZIhvcNAQEMBQAw\ngZoxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEzMDEGA1UEAwwq\nQW1hem9uIFJEUyBjYS1jZW50cmFsLTEgUm9vdCBDQSBSU0E0MDk2IEcxMRAwDgYD\nVQQHDAdTZWF0dGxlMCAXDTIxMDUyMTIyMDg1M1oYDzIxMjEwNTIxMjMwODUzWjCB\nmjELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTMwMQYDVQQDDCpB\nbWF6b24gUkRTIGNhLWNlbnRyYWwtMSBSb290IENBIFJTQTQwOTYgRzExEDAOBgNV\nBAcMB1NlYXR0bGUwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCpgUH6\nCrzd8cOw9prAh2rkQqAOx2vtuI7xX4tmBG4I/um28eBjyVmgwQ1fpq0Zg2nCKS54\nNn0pCmT7f3h6Bvopxn0J45AzXEtajFqXf92NQ3iPth95GVfAJSD7gk2LWMhpmID9\nJGQyoGuDPg+hYyr292X6d0madzEktVVGO4mKTF989qEg+tY8+oN0U2fRTrqa2tZp\niYsmg350ynNopvntsJAfpCO/srwpsqHHLNFZ9jvhTU8uW90wgaKO9i31j/mHggCE\n+CAOaJCM3g+L8DPl/2QKsb6UkBgaaIwKyRgKSj1IlgrK+OdCBCOgM9jjId4Tqo2j\nZIrrPBGl6fbn1+etZX+2/tf6tegz+yV0HHQRAcKCpaH8AXF44bny9andslBoNjGx\nH6R/3ib4FhPrnBMElzZ5i4+eM/cuPC2huZMBXb/jKgRC/QN1Wm3/nah5FWq+yn+N\ntiAF10Ga0BYzVhHDEwZzN7gn38bcY5yi/CjDUNpY0OzEe2+dpaBKPlXTaFfn9Nba\nCBmXPRF0lLGGtPeTAgjcju+NEcVa82Ht1pqxyu2sDtbu3J5bxp4RKtj+ShwN8nut\nTkf5Ea9rSmHEY13fzgibZlQhXaiFSKA2ASUwgJP19Putm0XKlBCNSGCoECemewxL\n+7Y8FszS4Uu4eaIwvXVqUEE2yf+4ex0hqQ1acQIDAQABo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBSeUnXIRxNbYsZLtKomIz4Y1nOZEzAOBgNVHQ8BAf8E\nBAMCAYYwDQYJKoZIhvcNAQEMBQADggIBAIpRvxVS0dzoosBh/qw65ghPUGSbP2D4\ndm6oYCv5g/zJr4fR7NzEbHOXX5aOQnHbQL4M/7veuOCLNPOW1uXwywMg6gY+dbKe\nYtPVA1as8G9sUyadeXyGh2uXGsziMFXyaESwiAXZyiYyKChS3+g26/7jwECFo5vC\nXGhWpIO7Hp35Yglp8AnwnEAo/PnuXgyt2nvyTSrxlEYa0jus6GZEZd77pa82U1JH\nqFhIgmKPWWdvELA3+ra1nKnvpWM/xX0pnMznMej5B3RT3Y+k61+kWghJE81Ix78T\n+tG4jSotgbaL53BhtQWBD1yzbbilqsGE1/DXPXzHVf9yD73fwh2tGWSaVInKYinr\na4tcrB3KDN/PFq0/w5/21lpZjVFyu/eiPj6DmWDuHW73XnRwZpHo/2OFkei5R7cT\nrn/YdDD6c1dYtSw5YNnS6hdCQ3sOiB/xbPRN9VWJa6se79uZ9NLz6RMOr73DNnb2\nbhIR9Gf7XAA5lYKqQk+A+stoKbIT0F65RnkxrXi/6vSiXfCh/bV6B41cf7MY/6YW\nehserSdjhQamv35rTFdM+foJwUKz1QN9n9KZhPxeRmwqPitAV79PloksOnX25ElN\nSlyxdndIoA1wia1HRd26EFm2pqfZ2vtD2EjU3wD42CXX4H8fKVDna30nNFSYF0yn\njGKc3k6UNxpg\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\n0Ws=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICtDCCAjqgAwIBAgIRAMyaTlVLN0ndGp4ffwKAfoMwCgYIKoZIzj0EAwMwgZkx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEyMDAGA1UEAwwpQW1h\nem9uIFJEUyBtZS1jZW50cmFsLTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjIwNTA3MDA0NDM3WhgPMjEyMjA1MDcwMTQ0MzdaMIGZMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMjAwBgNVBAMMKUFtYXpv\nbiBSRFMgbWUtY2VudHJhbC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAE19nCV1nsI6CohSor13+B25cr\nzg+IHdi9Y3L7ziQnHWI6yjBazvnKD+oC71aRRlR8b5YXsYGUQxWzPLHN7EGPcSGv\nbzA9SLG1KQYCJaQ0m9Eg/iGrwKWOgylbhVw0bCxoo0IwQDAPBgNVHRMBAf8EBTAD\nAQH/MB0GA1UdDgQWBBS4KsknsJXM9+QPEkBdZxUPaLr11zAOBgNVHQ8BAf8EBAMC\nAYYwCgYIKoZIzj0EAwMDaAAwZQIxAJaRgrYIEfXQMZQQDxMTYS0azpyWSseQooXo\nL3nYq4OHGBgYyQ9gVjvRYWU85PXbfgIwdi82DtANQFkCu+j+BU0JBY/uRKPEeYzo\nJG92igKIcXPqCoxIJ7lJbbzmuf73gQu5\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nTspdjbg=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIECTCCAvGgAwIBAgIRAJZFh4s9aZGzKaTMLrSb4acwDQYJKoZIhvcNAQELBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBCZXRhIHVzLWVhc3QtMSBSb290IENBIFJTQTIwNDggRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTE4MjEyODQxWhgPMjA2MTA1MTgyMjI4NDFa\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgQmV0YSB1cy1lYXN0LTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\n17i2yoU6diep+WrqxIn2CrDEO2NdJVwWTSckx4WMZlLpkQDoymSmkNHjq9ADIApD\nA31Cx+843apL7wub8QkFZD0Tk7/ThdHWJOzcAM3ov98QBPQfOC1W5zYIIRP2F+vQ\nTRETHQnLcW3rLv0NMk5oQvIKpJoC9ett6aeVrzu+4cU4DZVWYlJUoC/ljWzCluau\n8blfW0Vwin6OB7s0HCG5/wijQWJBU5SrP/KAIPeQi1GqG5efbqAXDr/ple0Ipwyo\nXjjl73LenGUgqpANlC9EAT4i7FkJcllLPeK3NcOHjuUG0AccLv1lGsHAxZLgjk/x\nz9ZcnVV9UFWZiyJTKxeKPwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud\nDgQWBBRWyMuZUo4gxCR3Luf9/bd2AqZ7CjAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZI\nhvcNAQELBQADggEBAIqN2DlIKlvDFPO0QUZQVFbsi/tLdYM98/vvzBpttlTGVMyD\ngJuQeHVz+MnhGIwoCGOlGU3OOUoIlLAut0+WG74qYczn43oA2gbMd7HoD7oL/IGg\nnjorBwJVcuuLv2G//SqM3nxGcLRtkRnQ+lvqPxMz9+0fKFUn6QcIDuF0QSfthLs2\nWSiGEPKO9c9RSXdRQ4pXA7c3hXng8P4A2ZmdciPne5Nu4I4qLDGZYRrRLRkNTrOi\nTyS6r2HNGUfgF7eOSeKt3NWL+mNChcYj71/Vycf5edeczpUgfnWy9WbPrK1svKyl\naAs2xg+X6O8qB+Mnj2dNBzm+lZIS3sIlm+nO9sg=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrjCCAjSgAwIBAgIRAPAlEk8VJPmEzVRRaWvTh2AwCgYIKoZIzj0EAwMwgZYx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEvMC0GA1UEAwwmQW1h\nem9uIFJEUyB1cy1lYXN0LTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTI1MjI0MTU1WhgPMjEyMTA1MjUyMzQxNTVaMIGWMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExLzAtBgNVBAMMJkFtYXpvbiBS\nRFMgdXMtZWFzdC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdTZWF0dGxl\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEx5xjrup8II4HOJw15NTnS3H5yMrQGlbj\nEDA5MMGnE9DmHp5dACIxmPXPMe/99nO7wNdl7G71OYPCgEvWm0FhdvVUeTb3LVnV\nBnaXt32Ek7/oxGk1T+Df03C+W0vmuJ+wo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0G\nA1UdDgQWBBTGXmqBWN/1tkSea4pNw0oHrjk2UDAOBgNVHQ8BAf8EBAMCAYYwCgYI\nKoZIzj0EAwMDaAAwZQIxAIqqZWCSrIkZ7zsv/FygtAusW6yvlL935YAWYPVXU30m\njkMFLM+/RJ9GMvnO8jHfCgIwB+whlkcItzE9CRQ6CsMo/d5cEHDUu/QW6jSIh9BR\nOGh9pTYPVkUbBiKPA7lVVhre\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nnWS0\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIGCTCCA/GgAwIBAgIRAOY7gfcBZgR2tqfBzMbFQCUwDQYJKoZIhvcNAQEMBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1zb3V0aGVhc3QtNCBSb290IENBIFJTQTQwOTYgRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjIwNTI1MTY1NDU5WhgPMjEyMjA1MjUxNzU0NTla\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtc291dGhlYXN0LTQgUm9vdCBDQSBSU0E0MDk2IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA\nlfxER43FuLRdL08bddF0YhbCP+XXKj1A/TFMXmd2My8XDei8rPXFYyyjMig9+xZw\nuAsIxLwz8uiA26CKA8bCZKg5VG2kTeOJAfvBJaLv1CZefs3Z4Uf1Sjvm6MF2yqEj\nGoORfyfL9HiZFTDuF/hcjWoKYCfMuG6M/wO8IbdICrX3n+BiYQJu/pFO660Mg3h/\n8YBBWYDbHoCiH/vkqqJugQ5BM3OI5nsElW51P1icEEqti4AZ7JmtSv9t7fIFBVyR\noaEyOgpp0sm193F/cDJQdssvjoOnaubsSYm1ep3awZAUyGN/X8MBrPY95d0hLhfH\nEhc5Icyg+hsosBljlAyksmt4hFQ9iBnWIz/ZTfGMck+6p3HVL9RDgvluez+rWv59\n8q7omUGsiPApy5PDdwI/Wt/KtC34/2sjslIJfvgifdAtkRPkhff1WEwER00ADrN9\neGGInaCpJfb1Rq8cV2n00jxg7DcEd65VR3dmIRb0bL+jWK62ni/WdEyomAOMfmGj\naWf78S/4rasHllWJ+QwnaUYY3u6N8Cgio0/ep4i34FxMXqMV3V0/qXdfhyabi/LM\nwCxNo1Dwt+s6OtPJbwO92JL+829QAxydfmaMTeHBsgMPkG7RwAekeuatKGHNsc2Z\nx2Q4C2wVvOGAhcHwxfM8JfZs3nDSZJndtVVnFlUY0UECAwEAAaNCMEAwDwYDVR0T\nAQH/BAUwAwEB/zAdBgNVHQ4EFgQUpnG7mWazy6k97/tb5iduRB3RXgQwDgYDVR0P\nAQH/BAQDAgGGMA0GCSqGSIb3DQEBDAUAA4ICAQCDLqq1Wwa9Tkuv7vxBnIeVvvFF\necTn+P+wJxl9Qa2ortzqTHZsBDyJO62d04AgBwiDXkJ9a+bthgG0H1J7Xee8xqv1\nxyX2yKj24ygHjspLotKP4eDMdDi5TYq+gdkbPmm9Q69B1+W6e049JVGXvWG8/7kU\nigxeuCYwtCCdUPRLf6D8y+1XMGgVv3/DSOHWvTg3MJ1wJ3n3+eve3rjGdRYWZeJu\nk21HLSZYzVrCtUsh2YAeLnUbSxVuT2Xr4JehYe9zW5HEQ8Je/OUfnCy9vzoN/ITw\nosAH+EBJQey7RxEDqMwCaRefH0yeHFcnOll0OXg/urnQmwbEYzQ1uutJaBPsjU0J\nQf06sMxI7GiB5nPE+CnI2sM6A9AW9kvwexGXpNJiLxF8dvPQthpOKGcYu6BFvRmt\n6ctfXd9b7JJoVqMWuf5cCY6ihpk1e9JTlAqu4Eb/7JNyGiGCR40iSLvV28un9wiE\nplrdYxwcNYq851BEu3r3AyYWw/UW1AKJ5tM+/Gtok+AphMC9ywT66o/Kfu44mOWm\nL3nSLSWEcgfUVgrikpnyGbUnGtgCmHiMlUtNVexcE7OtCIZoVAlCGKNu7tyuJf10\nQlk8oIIzfSIlcbHpOYoN79FkLoDNc2er4Gd+7w1oPQmdAB0jBJnA6t0OUBPKdDdE\nUfff2jrbfbzECn1ELg==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nfejbXelUSJSzDIdY\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIGCTCCA/GgAwIBAgIRAN7Y9G9i4I+ZaslPobE7VL4wDQYJKoZIhvcNAQEMBQAw\ngZwxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTE1MDMGA1UEAwws\nQW1hem9uIFJEUyBhcC1ub3J0aGVhc3QtMiBSb290IENBIFJTQTQwOTYgRzExEDAO\nBgNVBAcMB1NlYXR0bGUwIBcNMjEwNTIwMTYzMzIzWhgPMjEyMTA1MjAxNzMzMjNa\nMIGcMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywg\nSW5jLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExNTAzBgNVBAMM\nLEFtYXpvbiBSRFMgYXAtbm9ydGhlYXN0LTIgUm9vdCBDQSBSU0E0MDk2IEcxMRAw\nDgYDVQQHDAdTZWF0dGxlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA\n4BEPCiIfiK66Q/qa8k+eqf1Q3qsa6Xuu/fPkpuStXVBShhtXd3eqrM0iT4Xxs420\nVa0vSB3oZ7l86P9zYfa60n6PzRxdYFckYX330aI7L/oFIdaodB/C9szvROI0oLG+\n6RwmIF2zcprH0cTby8MiM7G3v9ykpq27g4WhDC1if2j8giOQL3oHpUaByekZNIHF\ndIllsI3RkXmR3xmmxoOxJM1B9MZi7e1CvuVtTGOnSGpNCQiqofehTGwxCN2wFSK8\nxysaWlw48G0VzZs7cbxoXMH9QbMpb4tpk0d+T8JfAPu6uWO9UwCLWWydf0CkmA/+\nD50/xd1t33X9P4FEaPSg5lYbHXzSLWn7oLbrN2UqMLaQrkoEBg/VGvzmfN0mbflw\n+T87bJ/VEOVNlG+gepyCTf89qIQVWOjuYMox4sK0PjzZGsYEuYiq1+OUT3vk/e5K\nag1fCcq2Isy4/iwB2xcXrsQ6ljwdk1fc+EmOnjGKrhuOHJY3S+RFv4ToQBsVyYhC\nXGaC3EkqIX0xaCpDimxYhFjWhpDXAjG/zJ+hRLDAMCMhl/LPGRk/D1kzSbPmdjpl\nlEMK5695PeBvEBTQdBQdOiYgOU3vWU6tzwwHfiM2/wgvess/q0FDAHfJhppbgbb9\n3vgsIUcsvoC5o29JvMsUxsDRvsAfEmMSDGkJoA/X6GECAwEAAaNCMEAwDwYDVR0T\nAQH/BAUwAwEB/zAdBgNVHQ4EFgQUgEWm1mZCbGD6ytbwk2UU1aLaOUUwDgYDVR0P\nAQH/BAQDAgGGMA0GCSqGSIb3DQEBDAUAA4ICAQBb4+ABTGBGwxK1U/q4g8JDqTQM\n1Wh8Oz8yAk4XtPJMAmCctxbd81cRnSnePWw/hxViLVtkZ/GsemvXfqAQyOn1coN7\nQeYSw+ZOlu0j2jEJVynmgsR7nIRqE7QkCyZAU+d2FTJUfmee+IiBiGyFGgxz9n7A\nJhBZ/eahBbiuoOik/APW2JWLh0xp0W0GznfJ8lAlaQTyDa8iDXmVtbJg9P9qzkvl\nFgPXQttzEOyooF8Pb2LCZO4kUz+1sbU7tHdr2YE+SXxt6D3SBv+Yf0FlvyWLiqVk\nGDEOlPPTDSjAWgKnqST8UJ0RDcZK/v1ixs7ayqQJU0GUQm1I7LGTErWXHMnCuHKe\nUKYuiSZwmTcJ06NgdhcCnGZgPq13ryMDqxPeltQc3n5eO7f1cL9ERYLDLOzm6A9P\noQ3MfcVOsbHgGHZWaPSeNrQRN9xefqBXH0ZPasgcH9WJdsLlEjVUXoultaHOKx3b\nUCCb+d3EfqF6pRT488ippOL6bk7zNubwhRa/+y4wjZtwe3kAX78ACJVcjPobH9jZ\nErySads5zdQeaoee5wRKdp3TOfvuCe4bwLRdhOLCHWzEcXzY3g/6+ppLvNom8o+h\nBh5X26G6KSfr9tqhQ3O9IcbARjnuPbvtJnoPY0gz3EHHGPhy0RNW8i2gl3nUp0ah\nPtjwbKW0hYAhIttT0Q==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICtzCCAj2gAwIBAgIQQRBQTs6Y3H1DDbpHGta3lzAKBggqhkjOPQQDAzCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLXNvdXRoZWFzdC0zIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDYxMTAwMTI0M1oYDzIxMjEwNjExMDExMjQzWjCBmzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTQwMgYDVQQDDCtBbWF6\nb24gUkRTIGFwLXNvdXRoZWFzdC0zIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEs0942Xj4m/gKA+WA6F5h\nAHYuek9eGpzTRoLJddM4rEV1T3eSueytMVKOSlS3Ub9IhyQrH2D8EHsLYk9ktnGR\npATk0kCYTqFbB7onNo070lmMJmGT/Q7NgwC8cySChFxbo0IwQDAPBgNVHRMBAf8E\nBTADAQH/MB0GA1UdDgQWBBQ20iKBKiNkcbIZRu0y1uoF1yJTEzAOBgNVHQ8BAf8E\nBAMCAYYwCgYIKoZIzj0EAwMDaAAwZQIwYv0wTSrpQTaPaarfLN8Xcqrqu3hzl07n\nFrESIoRw6Cx77ZscFi2/MV6AFyjCV/TlAjEAhpwJ3tpzPXpThRML8DMJYZ3YgMh3\nCMuLqhPpla3cL0PhybrD27hJWl29C4el6aMO\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrDCCAjOgAwIBAgIQGcztRyV40pyMKbNeSN+vXTAKBggqhkjOPQQDAzCBljEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMS8wLQYDVQQDDCZBbWF6\nb24gUkRTIHVzLWVhc3QtMiBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTAgFw0yMTA1MjEyMzE1NTZaGA8yMTIxMDUyMjAwMTU1NlowgZYxCzAJBgNV\nBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYD\nVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEvMC0GA1UEAwwmQW1hem9uIFJE\nUyB1cy1lYXN0LTIgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1NlYXR0bGUw\ndjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQfDcv+GGRESD9wT+I5YIPRsD3L+/jsiIis\nTr7t9RSbFl+gYpO7ZbDXvNbV5UGOC5lMJo/SnqFRTC6vL06NF7qOHfig3XO8QnQz\n6T5uhhrhnX2RSY3/10d2kTyHq3ZZg3+jQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYD\nVR0OBBYEFLDyD3PRyNXpvKHPYYxjHXWOgfPnMA4GA1UdDwEB/wQEAwIBhjAKBggq\nhkjOPQQDAwNnADBkAjB20HQp6YL7CqYD82KaLGzgw305aUKw2aMrdkBR29J183jY\n6Ocj9+Wcif9xnRMS+7oCMAvrt03rbh4SU9BohpRUcQ2Pjkh7RoY0jDR4Xq4qzjNr\n5UFr3BXpFvACxXF51BksGQ==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrjCCAjWgAwIBAgIQeKbS5zvtqDvRtwr5H48cAjAKBggqhkjOPQQDAzCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIG1lLXNvdXRoLTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTIwMTcxOTU1WhgPMjEyMTA1MjAxODE5NTVaMIGXMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpvbiBS\nRFMgbWUtc291dGgtMSBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwHU2VhdHRs\nZTB2MBAGByqGSM49AgEGBSuBBAAiA2IABEKjgUaAPmUlRMEQdBC7BScAGosJ1zRV\nLDd38qTBjzgmwBfQJ5ZfGIvyEK5unB09MB4e/3qqK5I/L6Qn5Px/n5g4dq0c7MQZ\nu7G9GBYm90U3WRJBf7lQrPStXaRnS4A/O6NCMEAwDwYDVR0TAQH/BAUwAwEB/zAd\nBgNVHQ4EFgQUNKcAbGEIn03/vkwd8g6jNyiRdD4wDgYDVR0PAQH/BAQDAgGGMAoG\nCCqGSM49BAMDA2cAMGQCMHIeTrjenCSYuGC6txuBt/0ZwnM/ciO9kHGWVCoK8QLs\njGghb5/YSFGZbmQ6qpGlSAIwVOQgdFfTpEfe5i+Vs9frLJ4QKAfc27cTNYzRIM0I\nE+AJgK4C4+DiyyMzOpiCfmvq\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nWT1QcNdw7ntUJP/w\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrzCCAjWgAwIBAgIQARky6+5PNFRkFVOp3Ob1CTAKBggqhkjOPQQDAzCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGV1LXNvdXRoLTIgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjIwNTIzMTg0MTI4WhgPMjEyMjA1MjMxOTQxMjdaMIGXMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpvbiBS\nRFMgZXUtc291dGgtMiBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwHU2VhdHRs\nZTB2MBAGByqGSM49AgEGBSuBBAAiA2IABNVGL5oF7cfIBxKyWd2PVK/S5yQfaJY3\nQFHWvEdt6951n9JhiiPrHzfVHsxZp1CBjILRMzjgRbYWmc8qRoLkgGE7htGdwudJ\nFa/WuKzO574Prv4iZXUnVGTboC7JdvKbh6NCMEAwDwYDVR0TAQH/BAUwAwEB/zAd\nBgNVHQ4EFgQUgDeIIEKynwUbNXApdIPnmRWieZwwDgYDVR0PAQH/BAQDAgGGMAoG\nCCqGSM49BAMDA2gAMGUCMEOOJfucrST+FxuqJkMZyCM3gWGZaB+/w6+XUAJC6hFM\nuSTY0F44/bERkA4XhH+YGAIxAIpJQBakCA1/mXjsTnQ+0El9ty+LODp8ibkn031c\n8DKDS7pR9UK7ZYdR6zFg3ZCjQw==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrjCCAjOgAwIBAgIQJvkWUcYLbnxtuwnyjMmntDAKBggqhkjOPQQDAzCBljEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMS8wLQYDVQQDDCZBbWF6\nb24gUkRTIGV1LXdlc3QtMyBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTAgFw0yMTA1MjUyMjI2MTJaGA8yMTIxMDUyNTIzMjYxMlowgZYxCzAJBgNV\nBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMwEQYD\nVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEvMC0GA1UEAwwmQW1hem9uIFJE\nUyBldS13ZXN0LTMgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1NlYXR0bGUw\ndjAQBgcqhkjOPQIBBgUrgQQAIgNiAARENn8uHCyjn1dFax4OeXxvbV861qsXFD9G\nDshumTmFzWWHN/69WN/AOsxy9XN5S7Cgad4gQgeYYYgZ5taw+tFo/jQvCLY//uR5\nuihcLuLJ78opvRPvD9kbWZ6oXfBtFkWjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYD\nVR0OBBYEFKiK3LpoF+gDnqPldGSwChBPCYciMA4GA1UdDwEB/wQEAwIBhjAKBggq\nhkjOPQQDAwNpADBmAjEA+7qfvRlnvF1Aosyp9HzxxCbN7VKu+QXXPhLEBWa5oeWW\nUOcifunf/IVLC4/FGCsLAjEAte1AYp+iJyOHDB8UYkhBE/1sxnFaTiEPbvQBU0wZ\nSuwWVLhu2wWDuSW+K7tTuL8p\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID/zCCAuegAwIBAgIRAKeDpqX5WFCGNo94M4v69sUwDQYJKoZIhvcNAQELBQAw\ngZcxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEwMC4GA1UEAwwn\nQW1hem9uIFJEUyBldS13ZXN0LTMgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyNTIyMTgzM1oYDzIwNjEwNTI1MjMxODMzWjCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGV1LXdlc3QtMyBSb290IENBIFJTQTIwNDggRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCcKOTEMTfzvs4H\nWtJR8gI7GXN6xesulWtZPv21oT+fLGwJ+9Bv8ADCGDDrDxfeH/HxJmzG9hgVAzVn\n4g97Bn7q07tGZM5pVi96/aNp11velZT7spOJKfJDZTlGns6DPdHmx48whpdO+dOb\n6+eR0VwCIv+Vl1fWXgoACXYCoKjhxJs+R+fwY//0JJ1YG8yjZ+ghLCJmvlkOJmE1\nTCPUyIENaEONd6T+FHGLVYRRxC2cPO65Jc4yQjsXvvQypoGgx7FwD5voNJnFMdyY\n754JGPOOe/SZdepN7Tz7UEq8kn7NQSbhmCsgA/Hkjkchz96qN/YJ+H/okiQUTNB0\neG9ogiVFAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFFjayw9Y\nMjbxfF14XAhMM2VPl0PfMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0BAQsFAAOC\nAQEAAtmx6d9+9CWlMoU0JCirtp4dSS41bBfb9Oor6GQ8WIr2LdfZLL6uES/ubJPE\n1Sh5Vu/Zon5/MbqLMVrfniv3UpQIof37jKXsjZJFE1JVD/qQfRzG8AlBkYgHNEiS\nVtD4lFxERmaCkY1tjKB4Dbd5hfhdrDy29618ZjbSP7NwAfnwb96jobCmMKgxVGiH\nUqsLSiEBZ33b2hI7PJ6iTJnYBWGuiDnsWzKRmheA4nxwbmcQSfjbrNwa93w3caL2\nv/4u54Kcasvcu3yFsUwJygt8z43jsGAemNZsS7GWESxVVlW93MJRn6M+MMakkl9L\ntWaXdHZ+KUV7LhfYLb0ajvb40w==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBDCCAuygAwIBAgIQJ5oxPEjefCsaESSwrxk68DANBgkqhkiG9w0BAQsFADCB\nmjELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTMwMQYDVQQDDCpB\nbWF6b24gUkRTIGV1LWNlbnRyYWwtMiBSb290IENBIFJTQTIwNDggRzExEDAOBgNV\nBAcMB1NlYXR0bGUwIBcNMjIwNjA2MjExNzA1WhgPMjA2MjA2MDYyMjE3MDVaMIGa\nMQswCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5j\nLjETMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMzAxBgNVBAMMKkFt\nYXpvbiBSRFMgZXUtY2VudHJhbC0yIFJvb3QgQ0EgUlNBMjA0OCBHMTEQMA4GA1UE\nBwwHU2VhdHRsZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALTQt5eX\ng+VP3BjO9VBkWJhE0GfLrU/QIk32I6WvrnejayTrlup9H1z4QWlXF7GNJrqScRMY\nKhJHlcP05aPsx1lYco6pdFOf42ybXyWHHJdShj4A5glU81GTT+VrXGzHSarLmtua\neozkQgPpDsSlPt0RefyTyel7r3Cq+5K/4vyjCTcIqbfgaGwTU36ffjM1LaPCuE4O\nnINMeD6YuImt2hU/mFl20FZ+IZQUIFZZU7pxGLqTRz/PWcH8tDDxnkYg7tNuXOeN\nJbTpXrw7St50/E9ZQ0llGS+MxJD8jGRAa/oL4G/cwnV8P2OEPVVkgN9xDDQeieo0\n3xkzolkDkmeKOnUCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU\nbwu8635iQGQMRanekesORM8Hkm4wDgYDVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEB\nCwUAA4IBAQAgN6LE9mUgjsj6xGCX1afYE69fnmCjjb0rC6eEe1mb/QZNcyw4XBIW\n6+zTXo4mjZ4ffoxb//R0/+vdTE7IvaLgfAZgFsLKJCtYDDstXZj8ujQnGR9Pig3R\nW+LpNacvOOSJSawNQq0Xrlcu55AU4buyD5VjcICnfF1dqBMnGTnh27m/scd/ZMx/\nkapHZ/fMoK2mAgSX/NvUKF3UkhT85vSSM2BTtET33DzCPDQTZQYxFBa4rFRmFi4c\nBLlmIReiCGyh3eJhuUUuYAbK6wLaRyPsyEcIOLMQmZe1+gAFm1+1/q5Ke9ugBmjf\nPbTWjsi/lfZ5CdVAhc5lmZj/l5aKqwaS\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrjCCAjSgAwIBAgIRAKKPTYKln9L4NTx9dpZGUjowCgYIKoZIzj0EAwMwgZYx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEvMC0GA1UEAwwmQW1h\nem9uIFJEUyBldS13ZXN0LTIgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTIxMjI1NTIxWhgPMjEyMTA1MjEyMzU1MjFaMIGWMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExLzAtBgNVBAMMJkFtYXpvbiBS\nRFMgZXUtd2VzdC0yIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdTZWF0dGxl\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAE/owTReDvaRqdmbtTzXbyRmEpKCETNj6O\nhZMKH0F8oU9Tmn8RU7kQQj6xUKEyjLPrFBN7c+26TvrVO1KmJAvbc8bVliiJZMbc\nC0yV5PtJTalvlMZA1NnciZuhxaxrzlK1o0IwQDAPBgNVHRMBAf8EBTADAQH/MB0G\nA1UdDgQWBBT4i5HaoHtrs7Mi8auLhMbKM1XevDAOBgNVHQ8BAf8EBAMCAYYwCgYI\nKoZIzj0EAwMDaAAwZQIxAK9A+8/lFdX4XJKgfP+ZLy5ySXC2E0Spoy12Gv2GdUEZ\np1G7c1KbWVlyb1d6subzkQIwKyH0Naf/3usWfftkmq8SzagicKz5cGcEUaULq4tO\nGzA/AMpr63IDBAqkZbMDTCmH\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrzCCAjWgAwIBAgIQTgIvwTDuNWQo0Oe1sOPQEzAKBggqhkjOPQQDAzCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGV1LW5vcnRoLTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTI0MjEwNjM4WhgPMjEyMTA1MjQyMjA2MzhaMIGXMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpvbiBS\nRFMgZXUtbm9ydGgtMSBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwHU2VhdHRs\nZTB2MBAGByqGSM49AgEGBSuBBAAiA2IABJuzXLU8q6WwSKXBvx8BbdIi3mPhb7Xo\nrNJBfuMW1XRj5BcKH1ZoGaDGw+BIIwyBJg8qNmCK8kqIb4cH8/Hbo3Y+xBJyoXq/\ncuk8aPrxiNoRsKWwiDHCsVxaK9L7GhHHAqNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd\nBgNVHQ4EFgQUYgcsdU4fm5xtuqLNppkfTHM2QMYwDgYDVR0PAQH/BAQDAgGGMAoG\nCCqGSM49BAMDA2gAMGUCMQDz/Rm89+QJOWJecYAmYcBWCcETASyoK1kbr4vw7Hsg\n7Ew3LpLeq4IRmTyuiTMl0gMCMAa0QSjfAnxBKGhAnYxcNJSntUyyMpaXzur43ec0\n3D8npJghwC4DuICtKEkQiI5cSg==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nu3UBpZI=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICtDCCAjmgAwIBAgIQenQbcP/Zbj9JxvZ+jXbRnTAKBggqhkjOPQQDAzCBmTEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTIwMAYDVQQDDClBbWF6\nb24gUkRTIGV1LWNlbnRyYWwtMSBSb290IENBIEVDQzM4NCBHMTEQMA4GA1UEBwwH\nU2VhdHRsZTAgFw0yMTA1MjEyMjMzMjRaGA8yMTIxMDUyMTIzMzMyNFowgZkxCzAJ\nBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMuMRMw\nEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEyMDAGA1UEAwwpQW1hem9u\nIFJEUyBldS1jZW50cmFsLTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAATlBHiEM9LoEb1Hdnd5j2VpCDOU\n5nGuFoBD8ROUCkFLFh5mHrHfPXwBc63heW9WrP3qnDEm+UZEUvW7ROvtWCTPZdLz\nZ4XaqgAlSqeE2VfUyZOZzBSgUUJk7OlznXfkCMOjQjBAMA8GA1UdEwEB/wQFMAMB\nAf8wHQYDVR0OBBYEFDT/ThjQZl42Nv/4Z/7JYaPNMly2MA4GA1UdDwEB/wQEAwIB\nhjAKBggqhkjOPQQDAwNpADBmAjEAnZWmSgpEbmq+oiCa13l5aGmxSlfp9h12Orvw\nDq/W5cENJz891QD0ufOsic5oGq1JAjEAp5kSJj0MxJBTHQze1Aa9gG4sjHBxXn98\n4MP1VGsQuhfndNHQb4V0Au7OWnOeiobq\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID/zCCAuegAwIBAgIRAMgnyikWz46xY6yRgiYwZ3swDQYJKoZIhvcNAQELBQAw\ngZcxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEwMC4GA1UEAwwn\nQW1hem9uIFJEUyBldS13ZXN0LTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyMDE2NDkxMloYDzIwNjEwNTIwMTc0OTEyWjCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGV1LXdlc3QtMSBSb290IENBIFJTQTIwNDggRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCi8JYOc9cYSgZH\ngYPxLk6Xcc7HqzamvsnjYU98Dcb98y6iDqS46Ra2Ne02MITtU5MDL+qjxb8WGDZV\nRUA9ZS69tkTO3gldW8QdiSh3J6hVNJQW81F0M7ZWgV0gB3n76WCmfT4IWos0AXHM\n5v7M/M4tqVmCPViQnZb2kdVlM3/Xc9GInfSMCgNfwHPTXl+PXX+xCdNBePaP/A5C\n5S0oK3HiXaKGQAy3K7VnaQaYdiv32XUatlM4K2WS4AMKt+2cw3hTCjlmqKRHvYFQ\nveWCXAuc+U5PQDJ9SuxB1buFJZhT4VP3JagOuZbh5NWpIbOTxlAJOb5pGEDuJTKi\n1gQQQVEFAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFNXm+N87\nOFxK9Af/bjSxDCiulGUzMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0BAQsFAAOC\nAQEAkqIbkgZ45spvrgRQ6n9VKzDLvNg+WciLtmVrqyohwwJbj4pYvWwnKQCkVc7c\nhUOSBmlSBa5REAPbH5o8bdt00FPRrD6BdXLXhaECKgjsHe1WW08nsequRKD8xVmc\n8bEX6sw/utBeBV3mB+3Zv7ejYAbDFM4vnRsWtO+XqgReOgrl+cwdA6SNQT9oW3e5\nrSQ+VaXgJtl9NhkiIysq9BeYigxqS/A13pHQp0COMwS8nz+kBPHhJTsajHCDc8F4\nHfLi6cgs9G0gaRhT8FCH66OdGSqn196sE7Y3bPFFFs/3U+vxvmQgoZC6jegQXAg5\nPrxd+VNXtNI/azitTysQPumH7A==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEBTCCAu2gAwIBAgIRAO8bekN7rUReuNPG8pSTKtEwDQYJKoZIhvcNAQELBQAw\ngZoxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEzMDEGA1UEAwwq\nQW1hem9uIFJEUyBldS1jZW50cmFsLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYD\nVQQHDAdTZWF0dGxlMCAXDTIxMDUyMTIyMjM0N1oYDzIwNjEwNTIxMjMyMzQ3WjCB\nmjELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTMwMQYDVQQDDCpB\nbWF6b24gUkRTIGV1LWNlbnRyYWwtMSBSb290IENBIFJTQTIwNDggRzExEDAOBgNV\nBAcMB1NlYXR0bGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCTTYds\nTray+Q9VA5j5jTh5TunHKFQzn68ZbOzdqaoi/Rq4ohfC0xdLrxCpfqn2TGDHN6Zi\n2qGK1tWJZEd1H0trhzd9d1CtGK+3cjabUmz/TjSW/qBar7e9MA67/iJ74Gc+Ww43\nA0xPNIWcL4aLrHaLm7sHgAO2UCKsrBUpxErOAACERScVYwPAfu79xeFcX7DmcX+e\nlIqY16pQAvK2RIzrekSYfLFxwFq2hnlgKHaVgZ3keKP+nmXcXmRSHQYUUr72oYNZ\nHcNYl2+gxCc9ccPEHM7xncVEKmb5cWEWvVoaysgQ+osi5f5aQdzgC2X2g2daKbyA\nXL/z5FM9GHpS5BJjAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYE\nFBDAiJ7Py9/A9etNa/ebOnx5l5MGMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0B\nAQsFAAOCAQEALMh/+81fFPdJV/RrJUeoUvFCGMp8iaANu97NpeJyKitNOv7RoeVP\nWjivS0KcCqZaDBs+p6IZ0sLI5ZH098LDzzytcfZg0PsGqUAb8a0MiU/LfgDCI9Ee\njsOiwaFB8k0tfUJK32NPcIoQYApTMT2e26lPzYORSkfuntme2PTHUnuC7ikiQrZk\nP+SZjWgRuMcp09JfRXyAYWIuix4Gy0eZ4rpRuaTK6mjAb1/LYoNK/iZ/gTeIqrNt\nl70OWRsWW8jEmSyNTIubGK/gGGyfuZGSyqoRX6OKHESkP6SSulbIZHyJ5VZkgtXo\n2XvyRyJ7w5pFyoofrL3Wv0UF8yt/GDszmg==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIF/zCCA+egAwIBAgIRAMDk/F+rrhdn42SfE+ghPC8wDQYJKoZIhvcNAQEMBQAw\ngZcxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEwMC4GA1UEAwwn\nQW1hem9uIFJEUyBldS13ZXN0LTIgUm9vdCBDQSBSU0E0MDk2IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyMTIyNTEyMloYDzIxMjEwNTIxMjM1MTIyWjCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGV1LXdlc3QtMiBSb290IENBIFJTQTQwOTYgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQC2twMALVg9vRVu\nVNqsr6N8thmp3Dy8jEGTsm3GCQ+C5P2YcGlD/T/5icfWW84uF7Sx3ezcGlvsqFMf\nUkj9sQyqtz7qfFFugyy7pa/eH9f48kWFHLbQYm9GEgbYBIrWMp1cy3vyxuMCwQN4\nDCncqU+yNpy0CprQJEha3PzY+3yJOjDQtc3zr99lyECCFJTDUucxHzyQvX89eL74\nuh8la0lKH3v9wPpnEoftbrwmm5jHNFdzj7uXUHUJ41N7af7z7QUfghIRhlBDiKtx\n5lYZemPCXajTc3ryDKUZC/b+B6ViXZmAeMdmQoPE0jwyEp/uaUcdp+FlUQwCfsBk\nayPFEApTWgPiku2isjdeTVmEgL8bJTDUZ6FYFR7ZHcYAsDzcwHgIu3GGEMVRS3Uf\nILmioiyly9vcK4Sa01ondARmsi/I0s7pWpKflaekyv5boJKD/xqwz9lGejmJHelf\n8Od2TyqJScMpB7Q8c2ROxBwqwB72jMCEvYigB+Wnbb8RipliqNflIGx938FRCzKL\nUQUBmNAznR/yRRL0wHf9UAE/8v9a09uZABeiznzOFAl/frHpgdAbC00LkFlnwwgX\ng8YfEFlkp4fLx5B7LtoO6uVNFVimLxtwirpyKoj3G4M/kvSTux8bTw0heBCmWmKR\n57MS6k7ODzbv+Kpeht2hqVZCNFMxoQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/\nMB0GA1UdDgQWBBRuMnDhJjoj7DcKALj+HbxEqj3r6jAOBgNVHQ8BAf8EBAMCAYYw\nDQYJKoZIhvcNAQEMBQADggIBALSnXfx72C3ldhBP5kY4Mo2DDaGQ8FGpTOOiD95d\n0rf7I9LrsBGVqu/Nir+kqqP80PB70+Jy9fHFFigXwcPBX3MpKGxK8Cel7kVf8t1B\n4YD6A6bqlzP+OUL0uGWfZpdpDxwMDI2Flt4NEldHgXWPjvN1VblEKs0+kPnKowyg\njhRMgBbD/y+8yg0fIcjXUDTAw/+INcp21gWaMukKQr/8HswqC1yoqW9in2ijQkpK\n2RB9vcQ0/gXR0oJUbZQx0jn0OH8Agt7yfMAnJAdnHO4M3gjvlJLzIC5/4aGrRXZl\nJoZKfJ2fZRnrFMi0nhAYDeInoS+Rwx+QzaBk6fX5VPyCj8foZ0nmqvuYoydzD8W5\nmMlycgxFqS+DUmO+liWllQC4/MnVBlHGB1Cu3wTj5kgOvNs/k+FW3GXGzD3+rpv0\nQTLuwSbMr+MbEThxrSZRSXTCQzKfehyC+WZejgLb+8ylLJUA10e62o7H9PvCrwj+\nZDVmN7qj6amzvndCP98sZfX7CFZPLfcBd4wVIjHsFjSNEwWHOiFyLPPG7cdolGKA\nlOFvonvo4A1uRc13/zFeP0Xi5n5OZ2go8aOOeGYdI2vB2sgH9R2IASH/jHmr0gvY\n0dfBCcfXNgrS0toq0LX/y+5KkKOxh52vEYsJLdhqrveuZhQnsFEm/mFwjRXkyO7c\n2jpC\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nFEv9Bg==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICsDCCAjagAwIBAgIRAMgApnfGYPpK/fD0dbN2U4YwCgYIKoZIzj0EAwMwgZcx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEwMC4GA1UEAwwnQW1h\nem9uIFJEUyBldS1zb3V0aC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMCAXDTIxMDUxOTE4MzgxMVoYDzIxMjEwNTE5MTkzODExWjCBlzELMAkG\nA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4xEzAR\nBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6b24g\nUkRTIGV1LXNvdXRoLTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1NlYXR0\nbGUwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQfEWl6d4qSuIoECdZPp+39LaKsfsX7\nTHs3/RrtT0+h/jl3bjZ7Qc68k16x+HGcHbaayHfqD0LPdzH/kKtNSfQKqemdxDQh\nZ4pwkixJu8T1VpXZ5zzCvBXCl75UqgEFS92jQjBAMA8GA1UdEwEB/wQFMAMBAf8w\nHQYDVR0OBBYEFFPrSNtWS5JU+Tvi6ABV231XbjbEMA4GA1UdDwEB/wQEAwIBhjAK\nBggqhkjOPQQDAwNoADBlAjEA+a7hF1IrNkBd2N/l7IQYAQw8chnRZDzh4wiGsZsC\n6A83maaKFWUKIb3qZYXFSi02AjAbp3wxH3myAmF8WekDHhKcC2zDvyOiKLkg9Y6v\nZVmyMR043dscQbcsVoacOYv198c=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICtDCCAjqgAwIBAgIRAPhVkIsQ51JFhD2kjFK5uAkwCgYIKoZIzj0EAwMwgZkx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEyMDAGA1UEAwwpQW1h\nem9uIFJEUyBldS1jZW50cmFsLTIgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjIwNjA2MjEyOTE3WhgPMjEyMjA2MDYyMjI5MTdaMIGZMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMjAwBgNVBAMMKUFtYXpv\nbiBSRFMgZXUtY2VudHJhbC0yIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEA5xnIEBtG5b2nmbj49UEwQza\nyX0844fXjccYzZ8xCDUe9dS2XOUi0aZlGblgSe/3lwjg8fMcKXLObGGQfgIx1+5h\nAIBjORis/dlyN5q/yH4U5sjS8tcR0GDGVHrsRUZCo0IwQDAPBgNVHRMBAf8EBTAD\nAQH/MB0GA1UdDgQWBBRK+lSGutXf4DkTjR3WNfv4+KeNFTAOBgNVHQ8BAf8EBAMC\nAYYwCgYIKoZIzj0EAwMDaAAwZQIxAJ4NxQ1Gerqr70ZrnUqc62Vl8NNqTzInamCG\nKce3FTsMWbS9qkgrjZkO9QqOcGIw/gIwSLrwUT+PKr9+H9eHyGvpq9/3AIYSnFkb\nCf3dyWPiLKoAtLFwjzB/CkJlsAS1c8dS\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIF/jCCA+agAwIBAgIQGZH12Q7x41qIh9vDu9ikTjANBgkqhkiG9w0BAQwFADCB\nlzELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdB\nbWF6b24gUkRTIGV1LXdlc3QtMyBSb290IENBIFJTQTQwOTYgRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjEwNTI1MjIyMjMzWhgPMjEyMTA1MjUyMzIyMzNaMIGXMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpv\nbiBSRFMgZXUtd2VzdC0zIFJvb3QgQ0EgUlNBNDA5NiBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMqE47sHXWzdpuqj\nJHb+6jM9tDbQLDFnYjDWpq4VpLPZhb7xPNh9gnYYTPKG4avG421EblAHqzy9D2pN\n1z90yKbIfUb/Sy2MhQbmZomsObhONEra06fJ0Dydyjswf1iYRp2kwpx5AgkVoNo7\n3dlws73zFjD7ImKvUx2C7B75bhnw2pJWkFnGcswl8fZt9B5Yt95sFOKEz2MSJE91\nkZlHtya19OUxZ/cSGci4MlOySzqzbGwUqGxEIDlY8I39VMwXaYQ8uXUN4G780VcL\nu46FeyRGxZGz2n3hMc805WAA1V5uir87vuirTvoSVREET97HVRGVVNJJ/FM6GXr1\nVKtptybbo81nefYJg9KBysxAa2Ao2x2ry/2ZxwhS6VZ6v1+90bpZA1BIYFEDXXn/\ndW07HSCFnYSlgPtSc+Muh15mdr94LspYeDqNIierK9i4tB6ep7llJAnq0BU91fM2\nJPeqyoTtc3m06QhLf68ccSxO4l8Hmq9kLSHO7UXgtdjfRVaffngopTNk8qK7bIb7\nLrgkqhiQw/PRCZjUdyXL153/fUcsj9nFNe25gM4vcFYwH6c5trd2tUl31NTi1MfG\nMgp3d2dqxQBIYANkEjtBDMy3SqQLIo9EymqmVP8xx2A/gCBgaxvMAsI6FSWRoC7+\nhqJ8XH4mFnXSHKtYMe6WPY+/XZgtAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8w\nHQYDVR0OBBYEFIkXqTnllT/VJnI2NqipA4XV8rh1MA4GA1UdDwEB/wQEAwIBhjAN\nBgkqhkiG9w0BAQwFAAOCAgEAKjSle8eenGeHgT8pltWCw/HzWyQruVKhfYIBfKJd\nMhV4EnH5BK7LxBIvpXGsFUrb0ThzSw0fn0zoA9jBs3i/Sj6KyeZ9qUF6b8ycDXd+\nwHonmJiQ7nk7UuMefaYAfs06vosgl1rI7eBHC0itexIQmKh0aX+821l4GEgEoSMf\nloMFTLXv2w36fPHHCsZ67ODldgcZbKNnpCTX0YrCwEYO3Pz/L398btiRcWGrewrK\njdxAAyietra8DRno1Zl87685tfqc6HsL9v8rVw58clAo9XAQvT+fmSOFw/PogRZ7\nOMHUat3gu/uQ1M5S64nkLLFsKu7jzudBuoNmcJysPlzIbqJ7vYc82OUGe9ucF3wi\n3tbKQ983hdJiTExVRBLX/fYjPsGbG3JtPTv89eg2tjWHlPhCDMMxyRKl6isu2RTq\n6VT489Z2zQrC33MYF8ZqO1NKjtyMAMIZwxVu4cGLkVsqFmEV2ScDHa5RadDyD3Ok\nm+mqybhvEVm5tPgY6p0ILPMN3yvJsMSPSvuBXhO/X5ppNnpw9gnxpwbjQKNhkFaG\nM5pkADZ14uRguOLM4VthSwUSEAr5VQYCFZhEwK+UOyJAGiB/nJz6IxL5XBNUXmRM\nHl8Xvz4riq48LMQbjcVQj0XvH941yPh+P8xOi00SGaQRaWp55Vyr4YKGbV0mEDz1\nr1o=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIF/zCCA+egAwIBAgIRAKwYju1QWxUZpn6D1gOtwgQwDQYJKoZIhvcNAQEMBQAw\ngZcxCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJ\nbmMuMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEwMC4GA1UEAwwn\nQW1hem9uIFJEUyBldS13ZXN0LTEgUm9vdCBDQSBSU0E0MDk2IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyMDE2NTM1NFoYDzIxMjEwNTIwMTc1MzU0WjCBlzEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdBbWF6\nb24gUkRTIGV1LXdlc3QtMSBSb290IENBIFJTQTQwOTYgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCKdBP1U4lqWWkc\nCb25/BKRTsvNVnISiKocva8GAzJyKfcGRa85gmgu41U+Hz6+39K+XkRfM0YS4BvQ\nF1XxWT0bNyypuvwCvmYShSTjN1TY0ltncDddahTajE/4MdSOZb/c98u0yt03cH+G\nhVwRyT50h0v/UEol50VfwcVAEZEgcQQYhf1IFUFlIvKpmDOqLuFakOnc7c9akK+i\nivST+JO1tgowbnNkn2iLlSSgUWgb1gjaOsNfysagv1RXdlyPw3EyfwkFifAQvF2P\nQ0ayYZfYS640cccv7efM1MSVyFHR9PrrDsF/zr2S2sGPbeHr7R/HwLl+S5J/l9N9\ny0rk6IHAWV4dEkOvgpnuJKURwA48iu1Hhi9e4moNS6eqoK2KmY3VFpuiyWcA73nH\nGSmyaH+YuMrF7Fnuu7GEHZL/o6+F5cL3mj2SJJhL7sz0ryf5Cs5R4yN9BIEj/f49\nwh84pM6nexoI0Q4wiSFCxWiBpjSmOK6h7z6+2utaB5p20XDZHhxAlmlx4vMuWtjh\nXckgRFxc+ZpVMU3cAHUpVEoO49e/+qKEpPzp8Xg4cToKw2+AfTk3cmyyXQfGwXMQ\nZUHNZ3w9ILMWihGCM2aGUsLcGDRennvNmnmin/SENsOQ8Ku0/a3teEzwV9cmmdYz\n5iYs1YtgPvKFobY6+T2RXXh+A5kprwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/\nMB0GA1UdDgQWBBSyUrsQVnKmA8z6/2Ech0rCvqpNmTAOBgNVHQ8BAf8EBAMCAYYw\nDQYJKoZIhvcNAQEMBQADggIBAFlj3IFmgiFz5lvTzFTRizhVofhTJsGr14Yfkuc7\nUrXPuXOwJomd4uot2d/VIeGJpfnuS84qGdmQyGewGTJ9inatHsGZgHl9NHNWRwKZ\nlTKTbBiq7aqgtUSFa06v202wpzU+1kadxJJePrbABxiXVfOmIW/a1a4hPNcT3syH\nFIEg1+CGsp71UNjBuwg3JTKWna0sLSKcxLOSOvX1fzxK5djzVpEsvQMB4PSAzXca\nvENgg2ErTwgTA+4s6rRtiBF9pAusN1QVuBahYP3ftrY6f3ycS4K65GnqscyfvKt5\nYgjtEKO3ZeeX8NpubMbzC+0Z6tVKfPFk/9TXuJtwvVeqow0YMrLLyRiYvK7EzJ97\nrrkxoKnHYQSZ+rH2tZ5SE392/rfk1PJL0cdHnkpDkUDO+8cKsFjjYKAQSNC52sKX\n74AVh6wMwxYwVZZJf2/2XxkjMWWhKNejsZhUkTISSmiLs+qPe3L67IM7GyKm9/m6\nR3r8x6NGjhTsKH64iYJg7AeKeax4b2e4hBb6GXFftyOs7unpEOIVkJJgM6gh3mwn\nR7v4gwFbLKADKt1vHuerSZMiTuNTGhSfCeDM53XI/mjZl2HeuCKP1mCDLlaO+gZR\nQ/G+E0sBKgEX4xTkAc3kgkuQGfExdGtnN2U2ehF80lBHB8+2y2E+xWWXih/ZyIcW\nwOx+\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\n89cEIGdbjsA=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEADCCAuigAwIBAgIQYjbPSg4+RNRD3zNxO1fuKDANBgkqhkiG9w0BAQsFADCB\nmDELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChB\nbWF6b24gUkRTIGV1LW5vcnRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUyNDIwNTkyMVoYDzIwNjEwNTI0MjE1OTIxWjCBmDEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChBbWF6\nb24gUkRTIGV1LW5vcnRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA179eQHxcV0YL\nXMkqEmhSBazHhnRVd8yICbMq82PitE3BZcnv1Z5Zs/oOgNmMkOKae4tCXO/41JCX\nwAgbs/eWWi+nnCfpQ/FqbLPg0h3dqzAgeszQyNl9IzTzX4Nd7JFRBVJXPIIKzlRf\n+GmFsAhi3rYgDgO27pz3ciahVSN+CuACIRYnA0K0s9lhYdddmrW/SYeWyoB7jPa2\nLmWpAs7bDOgS4LlP2H3eFepBPgNufRytSQUVA8f58lsE5w25vNiUSnrdlvDrIU5n\nQwzc7NIZCx4qJpRbSKWrUtbyJriWfAkGU7i0IoainHLn0eHp9bWkwb9D+C/tMk1X\nERZw2PDGkwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSFmR7s\ndAblusFN+xhf1ae0KUqhWTAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZIhvcNAQELBQAD\nggEBAHsXOpjPMyH9lDhPM61zYdja1ebcMVgfUvsDvt+w0xKMKPhBzYDMs/cFOi1N\nQ8LV79VNNfI2NuvFmGygcvTIR+4h0pqqZ+wjWl3Kk5jVxCrbHg3RBX02QLumKd/i\nkwGcEtTUvTssn3SM8bgM0/1BDXgImZPC567ciLvWDo0s/Fe9dJJC3E0G7d/4s09n\nOMdextcxFuWBZrBm/KK3QF0ByA8MG3//VXaGO9OIeeOJCpWn1G1PjT1UklYhkg61\nEbsTiZVA2DLd1BGzfU4o4M5mo68l0msse/ndR1nEY6IywwpgIFue7+rEleDh6b9d\nPYkG1rHVw2I0XDG4o17aOn5E94I=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEADCCAuigAwIBAgIQC6W4HFghUkkgyQw14a6JljANBgkqhkiG9w0BAQsFADCB\nmDELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChB\nbWF6b24gUkRTIGV1LXNvdXRoLTIgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIyMDUyMzE4MTYzMloYDzIwNjIwNTIzMTkxNjMyWjCBmDEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChBbWF6\nb24gUkRTIGV1LXNvdXRoLTIgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiM/t4FV2R9Nx\nUQG203UY83jInTa/6TMq0SPyg617FqYZxvz2kkx09x3dmxepUg9ttGMlPgjsRZM5\nLCFEi1FWk+hxHzt7vAdhHES5tdjwds3aIkgNEillmRDVrUsbrDwufLaa+MMDO2E1\nwQ/JYFXw16WBCCi2g1EtyQ2Xp+tZDX5IWOTnvhZpW8vVDptZ2AcJ5rMhfOYO3OsK\n5EF0GGA5ldzuezP+BkrBYGJ4wVKGxeaq9+5AT8iVZrypjwRkD7Y5CurywK3+aBwm\ns9Q5Nd8t45JCOUzYp92rFKsCriD86n/JnEvgDfdP6Hvtm0/DkwXK40Wz2q0Zrd0k\nmjP054NRPwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRR7yqd\nSfKcX2Q8GzhcVucReIpewTAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZIhvcNAQELBQAD\nggEBAEszBRDwXcZyNm07VcFwI1Im94oKwKccuKYeJEsizTBsVon8VpEiMwDs+yGu\n3p8kBhvkLwWybkD/vv6McH7T5b9jDX2DoOudqYnnaYeypsPH/00Vh3LvKagqzQza\norWLx+0tLo8xW4BtU+Wrn3JId8LvAhxyYXTn9bm+EwPcStp8xGLwu53OPD1RXYuy\nuu+3ps/2piP7GVfou7H6PRaqbFHNfiGg6Y+WA0HGHiJzn8uLmrRJ5YRdIOOG9/xi\nqTmAZloUNM7VNuurcMM2hWF494tQpsQ6ysg2qPjbBqzlGoOt3GfBTOZmqmwmqtam\nK7juWM/mdMQAJ3SMlE5wI8nVdx4=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIICrjCCAjSgAwIBAgIRAL9SdzVPcpq7GOpvdGoM80IwCgYIKoZIzj0EAwMwgZYx\nCzAJBgNVBAYTAlVTMSIwIAYDVQQKDBlBbWF6b24gV2ViIFNlcnZpY2VzLCBJbmMu\nMRMwEQYDVQQLDApBbWF6b24gUkRTMQswCQYDVQQIDAJXQTEvMC0GA1UEAwwmQW1h\nem9uIFJEUyBldS13ZXN0LTEgUm9vdCBDQSBFQ0MzODQgRzExEDAOBgNVBAcMB1Nl\nYXR0bGUwIBcNMjEwNTIwMTY1ODA3WhgPMjEyMTA1MjAxNzU4MDdaMIGWMQswCQYD\nVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjETMBEG\nA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExLzAtBgNVBAMMJkFtYXpvbiBS\nRFMgZXUtd2VzdC0xIFJvb3QgQ0EgRUNDMzg0IEcxMRAwDgYDVQQHDAdTZWF0dGxl\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEJWDgXebvwjR+Ce+hxKOLbnsfN5W5dOlP\nZn8kwWnD+SLkU81Eac/BDJsXGrMk6jFD1vg16PEkoSevsuYWlC8xR6FmT6F6pmeh\nfsMGOyJpfK4fyoEPhKeQoT23lFIc5Orjo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0G\nA1UdDgQWBBSVNAN1CHAz0eZ77qz2adeqjm31TzAOBgNVHQ8BAf8EBAMCAYYwCgYI\nKoZIzj0EAwMDaAAwZQIxAMlQeHbcjor49jqmcJ9gRLWdEWpXG8thIf6zfYQ/OEAg\nd7GDh4fR/OUk0VfjsBUN/gIwZB0bGdXvK38s6AAE/9IT051cz/wMe9GIrX1MnL1T\n1F5OqnXJdiwfZRRTHsRQ/L00\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\n1YfpdH2jp30=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID/jCCAuagAwIBAgIQTDc+UgTRtYO7ZGTQ8UWKDDANBgkqhkiG9w0BAQsFADCB\nlzELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTAwLgYDVQQDDCdB\nbWF6b24gUkRTIGV1LXdlc3QtMiBSb290IENBIFJTQTIwNDggRzExEDAOBgNVBAcM\nB1NlYXR0bGUwIBcNMjEwNTIxMjI0NjI0WhgPMjA2MTA1MjEyMzQ2MjRaMIGXMQsw\nCQYDVQQGEwJVUzEiMCAGA1UECgwZQW1hem9uIFdlYiBTZXJ2aWNlcywgSW5jLjET\nMBEGA1UECwwKQW1hem9uIFJEUzELMAkGA1UECAwCV0ExMDAuBgNVBAMMJ0FtYXpv\nbiBSRFMgZXUtd2VzdC0yIFJvb3QgQ0EgUlNBMjA0OCBHMTEQMA4GA1UEBwwHU2Vh\ndHRsZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM1oGtthQ1YiVIC2\ni4u4swMAGxAjc/BZp0yq0eP5ZQFaxnxs7zFAPabEWsrjeDzrRhdVO0h7zskrertP\ngblGhfD20JfjvCHdP1RUhy/nzG+T+hn6Takan/GIgs8grlBMRHMgBYHW7tklhjaH\n3F7LujhceAHhhgp6IOrpb6YTaTTaJbF3GTmkqxSJ3l1LtEoWz8Al/nL/Ftzxrtez\nVs6ebpvd7sw37sxmXBWX2OlvUrPCTmladw9OrllGXtCFw4YyLe3zozBlZ3cHzQ0q\nlINhpRcajTMfZrsiGCkQtoJT+AqVJPS2sHjqsEH8yiySW9Jbq4zyMbM1yqQ2vnnx\nMJgoYMcCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUaQG88UnV\nJPTI+Pcti1P+q3H7pGYwDgYDVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEBCwUAA4IB\nAQBAkgr75V0sEJimC6QRiTVWEuj2Khy7unjSfudbM6zumhXEU2/sUaVLiYy6cA/x\n3v0laDle6T07x9g64j5YastE/4jbzrGgIINFlY0JnaYmR3KZEjgi1s1fkRRf3llL\nPJm9u4Q1mbwAMQK/ZjLuuRcL3uRIHJek18nRqT5h43GB26qXyvJqeYYpYfIjL9+/\nYiZAbSRRZG+Li23cmPWrbA1CJY121SB+WybCbysbOXzhD3Sl2KSZRwSw4p2HrFtV\n1Prk0dOBtZxCG9luf87ultuDZpfS0w6oNBAMXocgswk24ylcADkkFxBWW+7BETn1\nEpK+t1Lm37mU4sxtuha00XAi\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIEADCCAuigAwIBAgIQcY44/8NUvBwr6LlHfRy7KjANBgkqhkiG9w0BAQsFADCB\nmDELMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIElu\nYy4xEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChB\nbWF6b24gUkRTIGV1LXNvdXRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQH\nDAdTZWF0dGxlMCAXDTIxMDUxOTE4MjcxOFoYDzIwNjEwNTE5MTkyNzE4WjCBmDEL\nMAkGA1UEBhMCVVMxIjAgBgNVBAoMGUFtYXpvbiBXZWIgU2VydmljZXMsIEluYy4x\nEzARBgNVBAsMCkFtYXpvbiBSRFMxCzAJBgNVBAgMAldBMTEwLwYDVQQDDChBbWF6\nb24gUkRTIGV1LXNvdXRoLTEgUm9vdCBDQSBSU0EyMDQ4IEcxMRAwDgYDVQQHDAdT\nZWF0dGxlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0UaBeC+Usalu\nEtXnV7+PnH+gi7/71tI/jkKVGKuhD2JDVvqLVoqbMHRh3+wGMvqKCjbHPcC2XMWv\n566fpAj4UZ9CLB5fVzss+QVNTl+FH2XhEzigopp+872ajsNzcZxrMkifxGb4i0U+\nt0Zi+UrbL5tsfP2JonKR1crOrbS6/DlzHBjIiJazGOQcMsJjNuTOItLbMohLpraA\n/nApa3kOvI7Ufool1/34MG0+wL3UUA4YkZ6oBJVxjZvvs6tI7Lzz/SnhK2widGdc\nsnbLqBpHNIZQSorVoiwcFaRBGYX/uzYkiw44Yfa4cK2V/B5zgu1Fbr0gbI2am4eh\nyVYyg4jPawIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS9gM1m\nIIjyh9O5H/7Vj0R/akI7UzAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZIhvcNAQELBQAD\nggEBAF0Sm9HC2AUyedBVnwgkVXMibnYChOzz7T+0Y+fOLXYAEXex2s8oqGeZdGYX\nJHkjBn7JXu7LM+TpTbPbFFDoc1sgMguD/ls+8XsqAl1CssW+amryIL+jfcfbgQ+P\nICwEUD9hGdjBgJ5WcuS+qqxHsEIlFNci3HxcxfBa9VsWs5TjI7Vsl4meL5lf7ZyL\nwDV7dHRuU+cImqG1MIvPRIlvPnT7EghrCYi2VCPhP2pM/UvShuwVnkz4MJ29ebIk\nWR9kpblFxFdE92D5UUvMCjC2kmtgzNiErvTcwIvOO9YCbBHzRB1fFiWrXUHhJWq9\nIkaxR5icb/IpAV0A1lYZEWMVsfQ=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\n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\nrM2p0kk=\n-----END CERTIFICATE-----\n"
  ];
  return defaults;
}
var proxies = {};
var hasRequiredProxies;
function requireProxies() {
  if (hasRequiredProxies) return proxies;
  hasRequiredProxies = 1;
  Object.defineProperty(proxies, "__esModule", { value: true });
  proxies.proxies = void 0;
  proxies.proxies = [
    "-----BEGIN CERTIFICATE-----\nMIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF\nADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6\nb24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL\nMAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv\nb3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj\nca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM\n9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw\nIFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6\nVOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L\n93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm\njgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC\nAYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA\nA4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI\nU5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs\nN+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv\no/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU\n5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy\nrqXRfboQnoZsG4q5WTP468SQvvG5\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIFQTCCAymgAwIBAgITBmyf0pY1hp8KD+WGePhbJruKNzANBgkqhkiG9w0BAQwF\nADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6\nb24gUm9vdCBDQSAyMB4XDTE1MDUyNjAwMDAwMFoXDTQwMDUyNjAwMDAwMFowOTEL\nMAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv\nb3QgQ0EgMjCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK2Wny2cSkxK\ngXlRmeyKy2tgURO8TW0G/LAIjd0ZEGrHJgw12MBvIITplLGbhQPDW9tK6Mj4kHbZ\nW0/jTOgGNk3Mmqw9DJArktQGGWCsN0R5hYGCrVo34A3MnaZMUnbqQ523BNFQ9lXg\n1dKmSYXpN+nKfq5clU1Imj+uIFptiJXZNLhSGkOQsL9sBbm2eLfq0OQ6PBJTYv9K\n8nu+NQWpEjTj82R0Yiw9AElaKP4yRLuH3WUnAnE72kr3H9rN9yFVkE8P7K6C4Z9r\n2UXTu/Bfh+08LDmG2j/e7HJV63mjrdvdfLC6HM783k81ds8P+HgfajZRRidhW+me\nz/CiVX18JYpvL7TFz4QuK/0NURBs+18bvBt+xa47mAExkv8LV/SasrlX6avvDXbR\n8O70zoan4G7ptGmh32n2M8ZpLpcTnqWHsFcQgTfJU7O7f/aS0ZzQGPSSbtqDT6Zj\nmUyl+17vIWR6IF9sZIUVyzfpYgwLKhbcAS4y2j5L9Z469hdAlO+ekQiG+r5jqFoz\n7Mt0Q5X5bGlSNscpb/xVA1wf+5+9R+vnSUeVC06JIglJ4PVhHvG/LopyboBZ/1c6\n+XUyo05f7O0oYtlNc/LMgRdg7c3r3NunysV+Ar3yVAhU/bQtCSwXVEqY0VThUWcI\n0u1ufm8/0i2BWSlmy5A5lREedCf+3euvAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMB\nAf8wDgYDVR0PAQH/BAQDAgGGMB0GA1UdDgQWBBSwDPBMMPQFWAJI/TPlUq9LhONm\nUjANBgkqhkiG9w0BAQwFAAOCAgEAqqiAjw54o+Ci1M3m9Zh6O+oAA7CXDpO8Wqj2\nLIxyh6mx/H9z/WNxeKWHWc8w4Q0QshNabYL1auaAn6AFC2jkR2vHat+2/XcycuUY\n+gn0oJMsXdKMdYV2ZZAMA3m3MSNjrXiDCYZohMr/+c8mmpJ5581LxedhpxfL86kS\nk5Nrp+gvU5LEYFiwzAJRGFuFjWJZY7attN6a+yb3ACfAXVU3dJnJUH/jWS5E4ywl\n7uxMMne0nxrpS10gxdr9HIcWxkPo1LsmmkVwXqkLN1PiRnsn/eBG8om3zEK2yygm\nbtmlyTrIQRNg91CMFa6ybRoVGld45pIq2WWQgj9sAq+uEjonljYE1x2igGOpm/Hl\nurR8FLBOybEfdF849lHqm/osohHUqS0nGkWxr7JOcQ3AWEbWaQbLU8uz/mtBzUF+\nfUwPfHJ5elnNXkoOrJupmHN5fLT0zLm4BwyydFy4x2+IoZCn9Kr5v2c69BoVYh63\nn749sSmvZ6ES8lgQGVMDMBu4Gon2nL2XA46jCfMdiyHxtN/kHNGfZQIG6lzWE7OE\n76KlXIx3KadowGuuQNKotOrN8I1LOJwZmhsoVLiJkO/KdYE+HvJkJMcYr07/R54H\n9jVlpNMKVv/1F2Rs76giJUmTtt8AF9pYfl3uxRuw0dFfIRDH+fO6AgonB8Xx1sfT\n4PsJYGw=\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIBtjCCAVugAwIBAgITBmyf1XSXNmY/Owua2eiedgPySjAKBggqhkjOPQQDAjA5\nMQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6b24g\nUm9vdCBDQSAzMB4XDTE1MDUyNjAwMDAwMFoXDTQwMDUyNjAwMDAwMFowOTELMAkG\nA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJvb3Qg\nQ0EgMzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABCmXp8ZBf8ANm+gBG1bG8lKl\nui2yEujSLtf6ycXYqm0fc4E7O5hrOXwzpcVOho6AF2hiRVd9RFgdszflZwjrZt6j\nQjBAMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgGGMB0GA1UdDgQWBBSr\nttvXBp43rDCGB5Fwx5zEGbF4wDAKBggqhkjOPQQDAgNJADBGAiEA4IWSoxe3jfkr\nBqWTrBqYaGFy+uGh0PsceGCmQ5nFuMQCIQCcAu/xlJyzlvnrxir4tiz+OpAUFteM\nYyRIHN8wfdVoOw==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIIB8jCCAXigAwIBAgITBmyf18G7EEwpQ+Vxe3ssyBrBDjAKBggqhkjOPQQDAzA5\nMQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6b24g\nUm9vdCBDQSA0MB4XDTE1MDUyNjAwMDAwMFoXDTQwMDUyNjAwMDAwMFowOTELMAkG\nA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJvb3Qg\nQ0EgNDB2MBAGByqGSM49AgEGBSuBBAAiA2IABNKrijdPo1MN/sGKe0uoe0ZLY7Bi\n9i0b2whxIdIA6GO9mif78DluXeo9pcmBqqNbIJhFXRbb/egQbeOc4OO9X4Ri83Bk\nM6DLJC9wuoihKqB1+IGuYgbEgds5bimwHvouXKNCMEAwDwYDVR0TAQH/BAUwAwEB\n/zAOBgNVHQ8BAf8EBAMCAYYwHQYDVR0OBBYEFNPsxzplbszh2naaVvuc84ZtV+WB\nMAoGCCqGSM49BAMDA2gAMGUCMDqLIfG9fhGt0O9Yli/W651+kI0rz2ZVwyzjKKlw\nCkcO8DdZEv8tmZQoTipPNU0zWgIxAOp1AE47xDqUEpHJWEadIRNyp4iciuRMStuW\n1KyLa2tJElMzrdfkviT8tQp21KW8EA==\n-----END CERTIFICATE-----\n",
    "-----BEGIN CERTIFICATE-----\nMIID7zCCAtegAwIBAgIBADANBgkqhkiG9w0BAQsFADCBmDELMAkGA1UEBhMCVVMx\nEDAOBgNVBAgTB0FyaXpvbmExEzARBgNVBAcTClNjb3R0c2RhbGUxJTAjBgNVBAoT\nHFN0YXJmaWVsZCBUZWNobm9sb2dpZXMsIEluYy4xOzA5BgNVBAMTMlN0YXJmaWVs\nZCBTZXJ2aWNlcyBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eSAtIEcyMB4XDTA5\nMDkwMTAwMDAwMFoXDTM3MTIzMTIzNTk1OVowgZgxCzAJBgNVBAYTAlVTMRAwDgYD\nVQQIEwdBcml6b25hMRMwEQYDVQQHEwpTY290dHNkYWxlMSUwIwYDVQQKExxTdGFy\nZmllbGQgVGVjaG5vbG9naWVzLCBJbmMuMTswOQYDVQQDEzJTdGFyZmllbGQgU2Vy\ndmljZXMgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgLSBHMjCCASIwDQYJKoZI\nhvcNAQEBBQADggEPADCCAQoCggEBANUMOsQq+U7i9b4Zl1+OiFOxHz/Lz58gE20p\nOsgPfTz3a3Y4Y9k2YKibXlwAgLIvWX/2h/klQ4bnaRtSmpDhcePYLQ1Ob/bISdm2\n8xpWriu2dBTrz/sm4xq6HZYuajtYlIlHVv8loJNwU4PahHQUw2eeBGg6345AWh1K\nTs9DkTvnVtYAcMtS7nt9rjrnvDH5RfbCYM8TWQIrgMw0R9+53pBlbQLPLJGmpufe\nhRhJfGZOozptqbXuNC66DQO4M99H67FrjSXZm86B0UVGMpZwh94CDklDhbZsc7tk\n6mFBrMnUVN+HL8cisibMn1lUaJ/8viovxFUcdUBgF4UCVTmLfwUCAwEAAaNCMEAw\nDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAQYwHQYDVR0OBBYEFJxfAN+q\nAdcwKziIorhtSpzyEZGDMA0GCSqGSIb3DQEBCwUAA4IBAQBLNqaEd2ndOxmfZyMI\nbw5hyf2E3F/YNoHN2BtBLZ9g3ccaaNnRbobhiCPPE95Dz+I0swSdHynVv/heyNXB\nve6SbzJ08pGCL72CQnqtKrcgfU28elUSwhXqvfdqlS5sdJ/PHLTyxQGjhdByPq1z\nqwubdQxtRbeOlKyWN7Wg0I8VRw7j6IPdj/3vQQF3zCepYoUz8jcI73HPdwbeyBkd\niEDPfUYd/x7H4c7/I9vG+o1VTqkC50cRRj70/b17KSa7qWFiNyi2LSr2EIZkyXCn\n0q23KXB56jzaYyWf/Wi3MOxw+3WKt21gZ7IeyLnp2KhvAotnDU0mV3HaIPzBSlCN\nsSi6\n-----END CERTIFICATE-----\n"
  ];
  return proxies;
}
var lib$1 = lib$2.exports;
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib) return lib$2.exports;
  hasRequiredLib = 1;
  Object.defineProperty(lib$1, "__esModule", { value: true });
  const defaults_js_1 = requireDefaults();
  const proxies_js_1 = requireProxies();
  const proxyBundle = {
    ca: proxies_js_1.proxies
  };
  const profiles = {
    ca: [...defaults_js_1.defaults, ...proxies_js_1.proxies]
  };
  lib$2.exports = profiles;
  lib$2.exports.proxyBundle = proxyBundle;
  lib$2.exports.default = profiles;
  return lib$2.exports;
}
var hasRequiredSsl_profiles;
function requireSsl_profiles() {
  if (hasRequiredSsl_profiles) return ssl_profiles;
  hasRequiredSsl_profiles = 1;
  (function(exports) {
    const awsCaBundle = requireLib();
    exports["Amazon RDS"] = {
      ca: awsCaBundle.ca
    };
  })(ssl_profiles);
  return ssl_profiles;
}
const { URL } = require$$0;
const ClientConstants$7 = client;
const Charsets$4 = charsets;
const { version } = require$$3;
let SSLProfiles = null;
const validOptions = {
  authPlugins: 1,
  authSwitchHandler: 1,
  bigNumberStrings: 1,
  charset: 1,
  charsetNumber: 1,
  compress: 1,
  connectAttributes: 1,
  connectTimeout: 1,
  database: 1,
  dateStrings: 1,
  debug: 1,
  decimalNumbers: 1,
  enableKeepAlive: 1,
  flags: 1,
  host: 1,
  insecureAuth: 1,
  infileStreamFactory: 1,
  isServer: 1,
  keepAliveInitialDelay: 1,
  localAddress: 1,
  maxPreparedStatements: 1,
  multipleStatements: 1,
  namedPlaceholders: 1,
  nestTables: 1,
  password: 1,
  // with multi-factor authentication, the main password (used for the first
  // authentication factor) can be provided via password1
  password1: 1,
  password2: 1,
  password3: 1,
  passwordSha1: 1,
  pool: 1,
  port: 1,
  queryFormat: 1,
  rowsAsArray: 1,
  socketPath: 1,
  ssl: 1,
  stream: 1,
  stringifyObjects: 1,
  supportBigNumbers: 1,
  timezone: 1,
  trace: 1,
  typeCast: 1,
  uri: 1,
  user: 1,
  disableEval: 1,
  // These options are used for Pool
  connectionLimit: 1,
  maxIdle: 1,
  idleTimeout: 1,
  Promise: 1,
  queueLimit: 1,
  waitForConnections: 1,
  jsonStrings: 1
};
let ConnectionConfig$3 = class ConnectionConfig {
  constructor(options) {
    if (typeof options === "string") {
      options = ConnectionConfig.parseUrl(options);
    } else if (options && options.uri) {
      const uriOptions = ConnectionConfig.parseUrl(options.uri);
      for (const key in uriOptions) {
        if (!Object.prototype.hasOwnProperty.call(uriOptions, key)) continue;
        if (options[key]) continue;
        options[key] = uriOptions[key];
      }
    }
    for (const key in options) {
      if (!Object.prototype.hasOwnProperty.call(options, key)) continue;
      if (validOptions[key] !== 1) {
        console.error(
          `Ignoring invalid configuration option passed to Connection: ${key}. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection`
        );
      }
    }
    this.isServer = options.isServer;
    this.stream = options.stream;
    this.host = options.host || "localhost";
    this.port = (typeof options.port === "string" ? parseInt(options.port, 10) : options.port) || 3306;
    this.localAddress = options.localAddress;
    this.socketPath = options.socketPath;
    this.user = options.user || void 0;
    this.password = options.password || options.password1 || void 0;
    this.password2 = options.password2 || void 0;
    this.password3 = options.password3 || void 0;
    this.passwordSha1 = options.passwordSha1 || void 0;
    this.database = options.database;
    this.connectTimeout = isNaN(options.connectTimeout) ? 10 * 1e3 : options.connectTimeout;
    this.insecureAuth = options.insecureAuth || false;
    this.infileStreamFactory = options.infileStreamFactory || void 0;
    this.supportBigNumbers = options.supportBigNumbers || false;
    this.bigNumberStrings = options.bigNumberStrings || false;
    this.decimalNumbers = options.decimalNumbers || false;
    this.dateStrings = options.dateStrings || false;
    this.debug = options.debug;
    this.trace = options.trace !== false;
    this.stringifyObjects = options.stringifyObjects || false;
    this.enableKeepAlive = options.enableKeepAlive !== false;
    this.keepAliveInitialDelay = options.keepAliveInitialDelay;
    if (options.timezone && !/^(?:local|Z|[ +-]\d\d:\d\d)$/.test(options.timezone)) {
      console.error(
        `Ignoring invalid timezone passed to Connection: ${options.timezone}. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection`
      );
      this.timezone = "Z";
    } else {
      this.timezone = options.timezone || "local";
    }
    this.queryFormat = options.queryFormat;
    this.pool = options.pool || void 0;
    this.ssl = typeof options.ssl === "string" ? ConnectionConfig.getSSLProfile(options.ssl) : options.ssl || false;
    this.multipleStatements = options.multipleStatements || false;
    this.rowsAsArray = options.rowsAsArray || false;
    this.namedPlaceholders = options.namedPlaceholders || false;
    this.nestTables = options.nestTables === void 0 ? void 0 : options.nestTables;
    this.typeCast = options.typeCast === void 0 ? true : options.typeCast;
    this.disableEval = Boolean(options.disableEval);
    if (this.timezone[0] === " ") {
      this.timezone = `+${this.timezone.slice(1)}`;
    }
    if (this.ssl) {
      if (typeof this.ssl !== "object") {
        throw new TypeError(
          `SSL profile must be an object, instead it's a ${typeof this.ssl}`
        );
      }
      this.ssl.rejectUnauthorized = this.ssl.rejectUnauthorized !== false;
    }
    this.maxPacketSize = 0;
    this.charsetNumber = options.charset ? ConnectionConfig.getCharsetNumber(options.charset) : options.charsetNumber || Charsets$4.UTF8MB4_UNICODE_CI;
    this.compress = options.compress || false;
    this.authPlugins = options.authPlugins;
    this.authSwitchHandler = options.authSwitchHandler;
    this.clientFlags = ConnectionConfig.mergeFlags(
      ConnectionConfig.getDefaultFlags(options),
      options.flags || ""
    );
    const defaultConnectAttributes = {
      _client_name: "Node-MySQL-2",
      _client_version: version
    };
    this.connectAttributes = {
      ...defaultConnectAttributes,
      ...options.connectAttributes || {}
    };
    this.maxPreparedStatements = options.maxPreparedStatements || 16e3;
    this.jsonStrings = options.jsonStrings || false;
  }
  static mergeFlags(default_flags, user_flags) {
    let flags = 0, i;
    if (!Array.isArray(user_flags)) {
      user_flags = String(user_flags || "").toUpperCase().split(/\s*,+\s*/);
    }
    for (i in default_flags) {
      if (user_flags.indexOf(`-${default_flags[i]}`) >= 0) {
        continue;
      }
      flags |= ClientConstants$7[default_flags[i]] || 0;
    }
    for (i in user_flags) {
      if (user_flags[i][0] === "-") {
        continue;
      }
      if (default_flags.indexOf(user_flags[i]) >= 0) {
        continue;
      }
      flags |= ClientConstants$7[user_flags[i]] || 0;
    }
    return flags;
  }
  static getDefaultFlags(options) {
    const defaultFlags = [
      "LONG_PASSWORD",
      "FOUND_ROWS",
      "LONG_FLAG",
      "CONNECT_WITH_DB",
      "ODBC",
      "LOCAL_FILES",
      "IGNORE_SPACE",
      "PROTOCOL_41",
      "IGNORE_SIGPIPE",
      "TRANSACTIONS",
      "RESERVED",
      "SECURE_CONNECTION",
      "MULTI_RESULTS",
      "TRANSACTIONS",
      "SESSION_TRACK",
      "CONNECT_ATTRS"
    ];
    if (options && options.multipleStatements) {
      defaultFlags.push("MULTI_STATEMENTS");
    }
    defaultFlags.push("PLUGIN_AUTH");
    defaultFlags.push("PLUGIN_AUTH_LENENC_CLIENT_DATA");
    return defaultFlags;
  }
  static getCharsetNumber(charset) {
    const num = Charsets$4[charset.toUpperCase()];
    if (num === void 0) {
      throw new TypeError(`Unknown charset '${charset}'`);
    }
    return num;
  }
  static getSSLProfile(name) {
    if (!SSLProfiles) {
      SSLProfiles = requireSsl_profiles();
    }
    const ssl = SSLProfiles[name];
    if (ssl === void 0) {
      throw new TypeError(`Unknown SSL profile '${name}'`);
    }
    return ssl;
  }
  static parseUrl(url) {
    const parsedUrl = new URL(url);
    const options = {
      host: decodeURIComponent(parsedUrl.hostname),
      port: parseInt(parsedUrl.port, 10),
      database: decodeURIComponent(parsedUrl.pathname.slice(1)),
      user: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password)
    };
    parsedUrl.searchParams.forEach((value, key) => {
      try {
        options[key] = JSON.parse(value);
      } catch (err) {
        options[key] = value;
      }
    });
    return options;
  }
};
var connection_config = ConnectionConfig$3;
var lib = {};
Object.defineProperty(lib, "__esModule", { value: true });
lib.createLRU = void 0;
const createLRU$3 = (options) => {
  let { max } = options;
  if (!(Number.isInteger(max) && max > 0))
    throw new TypeError("`max` must be a positive integer");
  let size2 = 0;
  let head = 0;
  let tail = 0;
  let free = [];
  const { onEviction } = options;
  const keyMap = /* @__PURE__ */ new Map();
  const keyList = new Array(max).fill(void 0);
  const valList = new Array(max).fill(void 0);
  const next = new Array(max).fill(0);
  const prev = new Array(max).fill(0);
  const setTail = (index2, type) => {
    if (index2 === tail)
      return;
    const nextIndex = next[index2];
    const prevIndex = prev[index2];
    if (index2 === head)
      head = nextIndex;
    else if (type === "get" || prevIndex !== 0)
      next[prevIndex] = nextIndex;
    if (nextIndex !== 0)
      prev[nextIndex] = prevIndex;
    next[tail] = index2;
    prev[index2] = tail;
    next[index2] = 0;
    tail = index2;
  };
  const _evict = () => {
    const evictHead = head;
    const key = keyList[evictHead];
    onEviction === null || onEviction === void 0 ? void 0 : onEviction(key, valList[evictHead]);
    keyMap.delete(key);
    keyList[evictHead] = void 0;
    valList[evictHead] = void 0;
    head = next[evictHead];
    if (head !== 0)
      prev[head] = 0;
    size2--;
    if (size2 === 0)
      head = tail = 0;
    free.push(evictHead);
    return evictHead;
  };
  return {
    /** Adds a key-value pair to the cache. Updates the value if the key already exists. */
    set(key, value) {
      if (key === void 0)
        return;
      let index2 = keyMap.get(key);
      if (index2 === void 0) {
        index2 = size2 === max ? _evict() : free.length > 0 ? free.pop() : size2;
        keyMap.set(key, index2);
        keyList[index2] = key;
        size2++;
      } else
        onEviction === null || onEviction === void 0 ? void 0 : onEviction(key, valList[index2]);
      valList[index2] = value;
      if (size2 === 1)
        head = tail = index2;
      else
        setTail(index2, "set");
    },
    /** Retrieves the value for a given key and moves the key to the most recent position. */
    get(key) {
      const index2 = keyMap.get(key);
      if (index2 === void 0)
        return;
      if (index2 !== tail)
        setTail(index2, "get");
      return valList[index2];
    },
    /** Retrieves the value for a given key without changing its position. */
    peek: (key) => {
      const index2 = keyMap.get(key);
      return index2 !== void 0 ? valList[index2] : void 0;
    },
    /** Checks if a key exists in the cache. */
    has: (key) => keyMap.has(key),
    /** Iterates over all keys in the cache, from most recent to least recent. */
    *keys() {
      let current = tail;
      for (let i = 0; i < size2; i++) {
        yield keyList[current];
        current = prev[current];
      }
    },
    /** Iterates over all values in the cache, from most recent to least recent. */
    *values() {
      let current = tail;
      for (let i = 0; i < size2; i++) {
        yield valList[current];
        current = prev[current];
      }
    },
    /** Iterates over `[key, value]` pairs in the cache, from most recent to least recent. */
    *entries() {
      let current = tail;
      for (let i = 0; i < size2; i++) {
        yield [keyList[current], valList[current]];
        current = prev[current];
      }
    },
    /** Iterates over each value-key pair in the cache, from most recent to least recent. */
    forEach: (callback) => {
      let current = tail;
      for (let i = 0; i < size2; i++) {
        const key = keyList[current];
        const value = valList[current];
        callback(value, key);
        current = prev[current];
      }
    },
    /** Deletes a key-value pair from the cache. */
    delete(key) {
      const index2 = keyMap.get(key);
      if (index2 === void 0)
        return false;
      onEviction === null || onEviction === void 0 ? void 0 : onEviction(key, valList[index2]);
      keyMap.delete(key);
      free.push(index2);
      keyList[index2] = void 0;
      valList[index2] = void 0;
      const prevIndex = prev[index2];
      const nextIndex = next[index2];
      if (prevIndex !== 0)
        next[prevIndex] = nextIndex;
      if (nextIndex !== 0)
        prev[nextIndex] = prevIndex;
      if (index2 === head)
        head = nextIndex;
      if (index2 === tail)
        tail = prevIndex;
      size2--;
      return true;
    },
    /** Evicts the oldest item or the specified number of the oldest items from the cache. */
    evict: (number) => {
      let toPrune = Math.min(number, size2);
      while (toPrune > 0) {
        _evict();
        toPrune--;
      }
    },
    /** Clears all key-value pairs from the cache. */
    clear() {
      if (typeof onEviction === "function") {
        const iterator = keyMap.values();
        for (let result = iterator.next(); !result.done; result = iterator.next())
          onEviction(keyList[result.value], valList[result.value]);
      }
      keyMap.clear();
      keyList.fill(void 0);
      valList.fill(void 0);
      free = [];
      size2 = 0;
      head = tail = 0;
    },
    /** Resizes the cache to a new maximum size, evicting items if necessary. */
    resize: (newMax) => {
      if (!(Number.isInteger(newMax) && newMax > 0))
        throw new TypeError("`max` must be a positive integer");
      if (newMax === max)
        return;
      if (newMax < max) {
        let current = tail;
        const preserve = Math.min(size2, newMax);
        const remove2 = size2 - preserve;
        const newKeyList = new Array(newMax);
        const newValList = new Array(newMax);
        const newNext = new Array(newMax);
        const newPrev = new Array(newMax);
        for (let i = 1; i <= remove2; i++)
          onEviction === null || onEviction === void 0 ? void 0 : onEviction(keyList[i], valList[i]);
        for (let i = preserve - 1; i >= 0; i--) {
          newKeyList[i] = keyList[current];
          newValList[i] = valList[current];
          newNext[i] = i + 1;
          newPrev[i] = i - 1;
          keyMap.set(newKeyList[i], i);
          current = prev[current];
        }
        head = 0;
        tail = preserve - 1;
        size2 = preserve;
        keyList.length = newMax;
        valList.length = newMax;
        next.length = newMax;
        prev.length = newMax;
        for (let i = 0; i < preserve; i++) {
          keyList[i] = newKeyList[i];
          valList[i] = newValList[i];
          next[i] = newNext[i];
          prev[i] = newPrev[i];
        }
        free = [];
        for (let i = preserve; i < newMax; i++)
          free.push(i);
      } else {
        const fill = newMax - max;
        keyList.push(...new Array(fill).fill(void 0));
        valList.push(...new Array(fill).fill(void 0));
        next.push(...new Array(fill).fill(0));
        prev.push(...new Array(fill).fill(0));
      }
      max = newMax;
    },
    /** Returns the maximum number of items that can be stored in the cache. */
    get max() {
      return max;
    },
    /** Returns the number of items currently stored in the cache. */
    get size() {
      return size2;
    },
    /** Returns the number of currently available slots in the cache before reaching the maximum size. */
    get available() {
      return max - size2;
    }
  };
};
lib.createLRU = createLRU$3;
const { createLRU: createLRU$2 } = lib;
const parserCache$2 = createLRU$2({
  max: 15e3
});
function keyFromFields(type, fields2, options, config) {
  const res = [
    type,
    typeof options.nestTables,
    options.nestTables,
    Boolean(options.rowsAsArray),
    Boolean(options.supportBigNumbers || config.supportBigNumbers),
    Boolean(options.bigNumberStrings || config.bigNumberStrings),
    typeof options.typeCast,
    options.timezone || config.timezone,
    Boolean(options.decimalNumbers),
    options.dateStrings
  ];
  for (let i = 0; i < fields2.length; ++i) {
    const field = fields2[i];
    res.push([
      field.name,
      field.columnType,
      field.length,
      field.schema,
      field.table,
      field.flags,
      field.characterSet
    ]);
  }
  return JSON.stringify(res, null, 0);
}
function getParser(type, fields2, options, config, compiler) {
  const key = keyFromFields(type, fields2, options, config);
  let parser = parserCache$2.get(key);
  if (parser) {
    return parser;
  }
  parser = compiler(fields2, options, config);
  parserCache$2.set(key, parser);
  return parser;
}
function setMaxCache(max) {
  parserCache$2.resize(max);
}
function clearCache() {
  parserCache$2.clear();
}
var parser_cache = {
  getParser,
  setMaxCache,
  clearCache,
  _keyFromFields: keyFromFields
};
function Denque(array, options) {
  var options = options || {};
  this._capacity = options.capacity;
  this._head = 0;
  this._tail = 0;
  if (Array.isArray(array)) {
    this._fromArray(array);
  } else {
    this._capacityMask = 3;
    this._list = new Array(4);
  }
}
Denque.prototype.peekAt = function peekAt(index2) {
  var i = index2;
  if (i !== (i | 0)) {
    return void 0;
  }
  var len = this.size();
  if (i >= len || i < -len) return void 0;
  if (i < 0) i += len;
  i = this._head + i & this._capacityMask;
  return this._list[i];
};
Denque.prototype.get = function get(i) {
  return this.peekAt(i);
};
Denque.prototype.peek = function peek() {
  if (this._head === this._tail) return void 0;
  return this._list[this._head];
};
Denque.prototype.peekFront = function peekFront() {
  return this.peek();
};
Denque.prototype.peekBack = function peekBack() {
  return this.peekAt(-1);
};
Object.defineProperty(Denque.prototype, "length", {
  get: function length() {
    return this.size();
  }
});
Denque.prototype.size = function size() {
  if (this._head === this._tail) return 0;
  if (this._head < this._tail) return this._tail - this._head;
  else return this._capacityMask + 1 - (this._head - this._tail);
};
Denque.prototype.unshift = function unshift(item) {
  if (arguments.length === 0) return this.size();
  var len = this._list.length;
  this._head = this._head - 1 + len & this._capacityMask;
  this._list[this._head] = item;
  if (this._tail === this._head) this._growArray();
  if (this._capacity && this.size() > this._capacity) this.pop();
  if (this._head < this._tail) return this._tail - this._head;
  else return this._capacityMask + 1 - (this._head - this._tail);
};
Denque.prototype.shift = function shift() {
  var head = this._head;
  if (head === this._tail) return void 0;
  var item = this._list[head];
  this._list[head] = void 0;
  this._head = head + 1 & this._capacityMask;
  if (head < 2 && this._tail > 1e4 && this._tail <= this._list.length >>> 2) this._shrinkArray();
  return item;
};
Denque.prototype.push = function push(item) {
  if (arguments.length === 0) return this.size();
  var tail = this._tail;
  this._list[tail] = item;
  this._tail = tail + 1 & this._capacityMask;
  if (this._tail === this._head) {
    this._growArray();
  }
  if (this._capacity && this.size() > this._capacity) {
    this.shift();
  }
  if (this._head < this._tail) return this._tail - this._head;
  else return this._capacityMask + 1 - (this._head - this._tail);
};
Denque.prototype.pop = function pop() {
  var tail = this._tail;
  if (tail === this._head) return void 0;
  var len = this._list.length;
  this._tail = tail - 1 + len & this._capacityMask;
  var item = this._list[this._tail];
  this._list[this._tail] = void 0;
  if (this._head < 2 && tail > 1e4 && tail <= len >>> 2) this._shrinkArray();
  return item;
};
Denque.prototype.removeOne = function removeOne(index2) {
  var i = index2;
  if (i !== (i | 0)) {
    return void 0;
  }
  if (this._head === this._tail) return void 0;
  var size2 = this.size();
  var len = this._list.length;
  if (i >= size2 || i < -size2) return void 0;
  if (i < 0) i += size2;
  i = this._head + i & this._capacityMask;
  var item = this._list[i];
  var k;
  if (index2 < size2 / 2) {
    for (k = index2; k > 0; k--) {
      this._list[i] = this._list[i = i - 1 + len & this._capacityMask];
    }
    this._list[i] = void 0;
    this._head = this._head + 1 + len & this._capacityMask;
  } else {
    for (k = size2 - 1 - index2; k > 0; k--) {
      this._list[i] = this._list[i = i + 1 + len & this._capacityMask];
    }
    this._list[i] = void 0;
    this._tail = this._tail - 1 + len & this._capacityMask;
  }
  return item;
};
Denque.prototype.remove = function remove(index2, count) {
  var i = index2;
  var removed;
  var del_count = count;
  if (i !== (i | 0)) {
    return void 0;
  }
  if (this._head === this._tail) return void 0;
  var size2 = this.size();
  var len = this._list.length;
  if (i >= size2 || i < -size2 || count < 1) return void 0;
  if (i < 0) i += size2;
  if (count === 1 || !count) {
    removed = new Array(1);
    removed[0] = this.removeOne(i);
    return removed;
  }
  if (i === 0 && i + count >= size2) {
    removed = this.toArray();
    this.clear();
    return removed;
  }
  if (i + count > size2) count = size2 - i;
  var k;
  removed = new Array(count);
  for (k = 0; k < count; k++) {
    removed[k] = this._list[this._head + i + k & this._capacityMask];
  }
  i = this._head + i & this._capacityMask;
  if (index2 + count === size2) {
    this._tail = this._tail - count + len & this._capacityMask;
    for (k = count; k > 0; k--) {
      this._list[i = i + 1 + len & this._capacityMask] = void 0;
    }
    return removed;
  }
  if (index2 === 0) {
    this._head = this._head + count + len & this._capacityMask;
    for (k = count - 1; k > 0; k--) {
      this._list[i = i + 1 + len & this._capacityMask] = void 0;
    }
    return removed;
  }
  if (i < size2 / 2) {
    this._head = this._head + index2 + count + len & this._capacityMask;
    for (k = index2; k > 0; k--) {
      this.unshift(this._list[i = i - 1 + len & this._capacityMask]);
    }
    i = this._head - 1 + len & this._capacityMask;
    while (del_count > 0) {
      this._list[i = i - 1 + len & this._capacityMask] = void 0;
      del_count--;
    }
    if (index2 < 0) this._tail = i;
  } else {
    this._tail = i;
    i = i + count + len & this._capacityMask;
    for (k = size2 - (count + index2); k > 0; k--) {
      this.push(this._list[i++]);
    }
    i = this._tail;
    while (del_count > 0) {
      this._list[i = i + 1 + len & this._capacityMask] = void 0;
      del_count--;
    }
  }
  if (this._head < 2 && this._tail > 1e4 && this._tail <= len >>> 2) this._shrinkArray();
  return removed;
};
Denque.prototype.splice = function splice(index2, count) {
  var i = index2;
  if (i !== (i | 0)) {
    return void 0;
  }
  var size2 = this.size();
  if (i < 0) i += size2;
  if (i > size2) return void 0;
  if (arguments.length > 2) {
    var k;
    var temp;
    var removed;
    var arg_len = arguments.length;
    var len = this._list.length;
    var arguments_index = 2;
    if (!size2 || i < size2 / 2) {
      temp = new Array(i);
      for (k = 0; k < i; k++) {
        temp[k] = this._list[this._head + k & this._capacityMask];
      }
      if (count === 0) {
        removed = [];
        if (i > 0) {
          this._head = this._head + i + len & this._capacityMask;
        }
      } else {
        removed = this.remove(i, count);
        this._head = this._head + i + len & this._capacityMask;
      }
      while (arg_len > arguments_index) {
        this.unshift(arguments[--arg_len]);
      }
      for (k = i; k > 0; k--) {
        this.unshift(temp[k - 1]);
      }
    } else {
      temp = new Array(size2 - (i + count));
      var leng = temp.length;
      for (k = 0; k < leng; k++) {
        temp[k] = this._list[this._head + i + count + k & this._capacityMask];
      }
      if (count === 0) {
        removed = [];
        if (i != size2) {
          this._tail = this._head + i + len & this._capacityMask;
        }
      } else {
        removed = this.remove(i, count);
        this._tail = this._tail - leng + len & this._capacityMask;
      }
      while (arguments_index < arg_len) {
        this.push(arguments[arguments_index++]);
      }
      for (k = 0; k < leng; k++) {
        this.push(temp[k]);
      }
    }
    return removed;
  } else {
    return this.remove(i, count);
  }
};
Denque.prototype.clear = function clear() {
  this._list = new Array(this._list.length);
  this._head = 0;
  this._tail = 0;
};
Denque.prototype.isEmpty = function isEmpty() {
  return this._head === this._tail;
};
Denque.prototype.toArray = function toArray() {
  return this._copyArray(false);
};
Denque.prototype._fromArray = function _fromArray(array) {
  var length2 = array.length;
  var capacity = this._nextPowerOf2(length2);
  this._list = new Array(capacity);
  this._capacityMask = capacity - 1;
  this._tail = length2;
  for (var i = 0; i < length2; i++) this._list[i] = array[i];
};
Denque.prototype._copyArray = function _copyArray(fullCopy, size2) {
  var src = this._list;
  var capacity = src.length;
  var length2 = this.length;
  size2 = size2 | length2;
  if (size2 == length2 && this._head < this._tail) {
    return this._list.slice(this._head, this._tail);
  }
  var dest = new Array(size2);
  var k = 0;
  var i;
  if (fullCopy || this._head > this._tail) {
    for (i = this._head; i < capacity; i++) dest[k++] = src[i];
    for (i = 0; i < this._tail; i++) dest[k++] = src[i];
  } else {
    for (i = this._head; i < this._tail; i++) dest[k++] = src[i];
  }
  return dest;
};
Denque.prototype._growArray = function _growArray() {
  if (this._head != 0) {
    var newList = this._copyArray(true, this._list.length << 1);
    this._tail = this._list.length;
    this._head = 0;
    this._list = newList;
  } else {
    this._tail = this._list.length;
    this._list.length <<= 1;
  }
  this._capacityMask = this._capacityMask << 1 | 1;
};
Denque.prototype._shrinkArray = function _shrinkArray() {
  this._list.length >>>= 1;
  this._capacityMask >>>= 1;
};
Denque.prototype._nextPowerOf2 = function _nextPowerOf2(num) {
  var log2 = Math.log(num) / Math.log(2);
  var nextPow2 = 1 << log2 + 1;
  return Math.max(nextPow2, 4);
};
var denque = Denque;
var errors = {};
(function(exports) {
  exports.EE_CANTCREATEFILE = 1;
  exports.EE_READ = 2;
  exports.EE_WRITE = 3;
  exports.EE_BADCLOSE = 4;
  exports.EE_OUTOFMEMORY = 5;
  exports.EE_DELETE = 6;
  exports.EE_LINK = 7;
  exports.EE_EOFERR = 9;
  exports.EE_CANTLOCK = 10;
  exports.EE_CANTUNLOCK = 11;
  exports.EE_DIR = 12;
  exports.EE_STAT = 13;
  exports.EE_CANT_CHSIZE = 14;
  exports.EE_CANT_OPEN_STREAM = 15;
  exports.EE_GETWD = 16;
  exports.EE_SETWD = 17;
  exports.EE_LINK_WARNING = 18;
  exports.EE_OPEN_WARNING = 19;
  exports.EE_DISK_FULL = 20;
  exports.EE_CANT_MKDIR = 21;
  exports.EE_UNKNOWN_CHARSET = 22;
  exports.EE_OUT_OF_FILERESOURCES = 23;
  exports.EE_CANT_READLINK = 24;
  exports.EE_CANT_SYMLINK = 25;
  exports.EE_REALPATH = 26;
  exports.EE_SYNC = 27;
  exports.EE_UNKNOWN_COLLATION = 28;
  exports.EE_FILENOTFOUND = 29;
  exports.EE_FILE_NOT_CLOSED = 30;
  exports.EE_CHANGE_OWNERSHIP = 31;
  exports.EE_CHANGE_PERMISSIONS = 32;
  exports.EE_CANT_SEEK = 33;
  exports.EE_CAPACITY_EXCEEDED = 34;
  exports.EE_DISK_FULL_WITH_RETRY_MSG = 35;
  exports.EE_FAILED_TO_CREATE_TIMER = 36;
  exports.EE_FAILED_TO_DELETE_TIMER = 37;
  exports.EE_FAILED_TO_CREATE_TIMER_QUEUE = 38;
  exports.EE_FAILED_TO_START_TIMER_NOTIFY_THREAD = 39;
  exports.EE_FAILED_TO_CREATE_TIMER_NOTIFY_THREAD_INTERRUPT_EVENT = 40;
  exports.EE_EXITING_TIMER_NOTIFY_THREAD = 41;
  exports.EE_WIN_LIBRARY_LOAD_FAILED = 42;
  exports.EE_WIN_RUN_TIME_ERROR_CHECK = 43;
  exports.EE_FAILED_TO_DETERMINE_LARGE_PAGE_SIZE = 44;
  exports.EE_FAILED_TO_KILL_ALL_THREADS = 45;
  exports.EE_FAILED_TO_CREATE_IO_COMPLETION_PORT = 46;
  exports.EE_FAILED_TO_OPEN_DEFAULTS_FILE = 47;
  exports.EE_FAILED_TO_HANDLE_DEFAULTS_FILE = 48;
  exports.EE_WRONG_DIRECTIVE_IN_CONFIG_FILE = 49;
  exports.EE_SKIPPING_DIRECTIVE_DUE_TO_MAX_INCLUDE_RECURSION = 50;
  exports.EE_INCORRECT_GRP_DEFINITION_IN_CONFIG_FILE = 51;
  exports.EE_OPTION_WITHOUT_GRP_IN_CONFIG_FILE = 52;
  exports.EE_CONFIG_FILE_PERMISSION_ERROR = 53;
  exports.EE_IGNORE_WORLD_WRITABLE_CONFIG_FILE = 54;
  exports.EE_USING_DISABLED_OPTION = 55;
  exports.EE_USING_DISABLED_SHORT_OPTION = 56;
  exports.EE_USING_PASSWORD_ON_CLI_IS_INSECURE = 57;
  exports.EE_UNKNOWN_SUFFIX_FOR_VARIABLE = 58;
  exports.EE_SSL_ERROR_FROM_FILE = 59;
  exports.EE_SSL_ERROR = 60;
  exports.EE_NET_SEND_ERROR_IN_BOOTSTRAP = 61;
  exports.EE_PACKETS_OUT_OF_ORDER = 62;
  exports.EE_UNKNOWN_PROTOCOL_OPTION = 63;
  exports.EE_FAILED_TO_LOCATE_SERVER_PUBLIC_KEY = 64;
  exports.EE_PUBLIC_KEY_NOT_IN_PEM_FORMAT = 65;
  exports.EE_DEBUG_INFO = 66;
  exports.EE_UNKNOWN_VARIABLE = 67;
  exports.EE_UNKNOWN_OPTION = 68;
  exports.EE_UNKNOWN_SHORT_OPTION = 69;
  exports.EE_OPTION_WITHOUT_ARGUMENT = 70;
  exports.EE_OPTION_REQUIRES_ARGUMENT = 71;
  exports.EE_SHORT_OPTION_REQUIRES_ARGUMENT = 72;
  exports.EE_OPTION_IGNORED_DUE_TO_INVALID_VALUE = 73;
  exports.EE_OPTION_WITH_EMPTY_VALUE = 74;
  exports.EE_FAILED_TO_ASSIGN_MAX_VALUE_TO_OPTION = 75;
  exports.EE_INCORRECT_BOOLEAN_VALUE_FOR_OPTION = 76;
  exports.EE_FAILED_TO_SET_OPTION_VALUE = 77;
  exports.EE_INCORRECT_INT_VALUE_FOR_OPTION = 78;
  exports.EE_INCORRECT_UINT_VALUE_FOR_OPTION = 79;
  exports.EE_ADJUSTED_SIGNED_VALUE_FOR_OPTION = 80;
  exports.EE_ADJUSTED_UNSIGNED_VALUE_FOR_OPTION = 81;
  exports.EE_ADJUSTED_ULONGLONG_VALUE_FOR_OPTION = 82;
  exports.EE_ADJUSTED_DOUBLE_VALUE_FOR_OPTION = 83;
  exports.EE_INVALID_DECIMAL_VALUE_FOR_OPTION = 84;
  exports.EE_COLLATION_PARSER_ERROR = 85;
  exports.EE_FAILED_TO_RESET_BEFORE_PRIMARY_IGNORABLE_CHAR = 86;
  exports.EE_FAILED_TO_RESET_BEFORE_TERTIARY_IGNORABLE_CHAR = 87;
  exports.EE_SHIFT_CHAR_OUT_OF_RANGE = 88;
  exports.EE_RESET_CHAR_OUT_OF_RANGE = 89;
  exports.EE_UNKNOWN_LDML_TAG = 90;
  exports.EE_FAILED_TO_RESET_BEFORE_SECONDARY_IGNORABLE_CHAR = 91;
  exports.EE_FAILED_PROCESSING_DIRECTIVE = 92;
  exports.EE_PTHREAD_KILL_FAILED = 93;
  exports.HA_ERR_KEY_NOT_FOUND = 120;
  exports.HA_ERR_FOUND_DUPP_KEY = 121;
  exports.HA_ERR_INTERNAL_ERROR = 122;
  exports.HA_ERR_RECORD_CHANGED = 123;
  exports.HA_ERR_WRONG_INDEX = 124;
  exports.HA_ERR_ROLLED_BACK = 125;
  exports.HA_ERR_CRASHED = 126;
  exports.HA_ERR_WRONG_IN_RECORD = 127;
  exports.HA_ERR_OUT_OF_MEM = 128;
  exports.HA_ERR_NOT_A_TABLE = 130;
  exports.HA_ERR_WRONG_COMMAND = 131;
  exports.HA_ERR_OLD_FILE = 132;
  exports.HA_ERR_NO_ACTIVE_RECORD = 133;
  exports.HA_ERR_RECORD_DELETED = 134;
  exports.HA_ERR_RECORD_FILE_FULL = 135;
  exports.HA_ERR_INDEX_FILE_FULL = 136;
  exports.HA_ERR_END_OF_FILE = 137;
  exports.HA_ERR_UNSUPPORTED = 138;
  exports.HA_ERR_TOO_BIG_ROW = 139;
  exports.HA_WRONG_CREATE_OPTION = 140;
  exports.HA_ERR_FOUND_DUPP_UNIQUE = 141;
  exports.HA_ERR_UNKNOWN_CHARSET = 142;
  exports.HA_ERR_WRONG_MRG_TABLE_DEF = 143;
  exports.HA_ERR_CRASHED_ON_REPAIR = 144;
  exports.HA_ERR_CRASHED_ON_USAGE = 145;
  exports.HA_ERR_LOCK_WAIT_TIMEOUT = 146;
  exports.HA_ERR_LOCK_TABLE_FULL = 147;
  exports.HA_ERR_READ_ONLY_TRANSACTION = 148;
  exports.HA_ERR_LOCK_DEADLOCK = 149;
  exports.HA_ERR_CANNOT_ADD_FOREIGN = 150;
  exports.HA_ERR_NO_REFERENCED_ROW = 151;
  exports.HA_ERR_ROW_IS_REFERENCED = 152;
  exports.HA_ERR_NO_SAVEPOINT = 153;
  exports.HA_ERR_NON_UNIQUE_BLOCK_SIZE = 154;
  exports.HA_ERR_NO_SUCH_TABLE = 155;
  exports.HA_ERR_TABLE_EXIST = 156;
  exports.HA_ERR_NO_CONNECTION = 157;
  exports.HA_ERR_NULL_IN_SPATIAL = 158;
  exports.HA_ERR_TABLE_DEF_CHANGED = 159;
  exports.HA_ERR_NO_PARTITION_FOUND = 160;
  exports.HA_ERR_RBR_LOGGING_FAILED = 161;
  exports.HA_ERR_DROP_INDEX_FK = 162;
  exports.HA_ERR_FOREIGN_DUPLICATE_KEY = 163;
  exports.HA_ERR_TABLE_NEEDS_UPGRADE = 164;
  exports.HA_ERR_TABLE_READONLY = 165;
  exports.HA_ERR_AUTOINC_READ_FAILED = 166;
  exports.HA_ERR_AUTOINC_ERANGE = 167;
  exports.HA_ERR_GENERIC = 168;
  exports.HA_ERR_RECORD_IS_THE_SAME = 169;
  exports.HA_ERR_LOGGING_IMPOSSIBLE = 170;
  exports.HA_ERR_CORRUPT_EVENT = 171;
  exports.HA_ERR_NEW_FILE = 172;
  exports.HA_ERR_ROWS_EVENT_APPLY = 173;
  exports.HA_ERR_INITIALIZATION = 174;
  exports.HA_ERR_FILE_TOO_SHORT = 175;
  exports.HA_ERR_WRONG_CRC = 176;
  exports.HA_ERR_TOO_MANY_CONCURRENT_TRXS = 177;
  exports.HA_ERR_NOT_IN_LOCK_PARTITIONS = 178;
  exports.HA_ERR_INDEX_COL_TOO_LONG = 179;
  exports.HA_ERR_INDEX_CORRUPT = 180;
  exports.HA_ERR_UNDO_REC_TOO_BIG = 181;
  exports.HA_FTS_INVALID_DOCID = 182;
  exports.HA_ERR_TABLE_IN_FK_CHECK = 183;
  exports.HA_ERR_TABLESPACE_EXISTS = 184;
  exports.HA_ERR_TOO_MANY_FIELDS = 185;
  exports.HA_ERR_ROW_IN_WRONG_PARTITION = 186;
  exports.HA_ERR_INNODB_READ_ONLY = 187;
  exports.HA_ERR_FTS_EXCEED_RESULT_CACHE_LIMIT = 188;
  exports.HA_ERR_TEMP_FILE_WRITE_FAILURE = 189;
  exports.HA_ERR_INNODB_FORCED_RECOVERY = 190;
  exports.HA_ERR_FTS_TOO_MANY_WORDS_IN_PHRASE = 191;
  exports.HA_ERR_FK_DEPTH_EXCEEDED = 192;
  exports.HA_MISSING_CREATE_OPTION = 193;
  exports.HA_ERR_SE_OUT_OF_MEMORY = 194;
  exports.HA_ERR_TABLE_CORRUPT = 195;
  exports.HA_ERR_QUERY_INTERRUPTED = 196;
  exports.HA_ERR_TABLESPACE_MISSING = 197;
  exports.HA_ERR_TABLESPACE_IS_NOT_EMPTY = 198;
  exports.HA_ERR_WRONG_FILE_NAME = 199;
  exports.HA_ERR_NOT_ALLOWED_COMMAND = 200;
  exports.HA_ERR_COMPUTE_FAILED = 201;
  exports.HA_ERR_ROW_FORMAT_CHANGED = 202;
  exports.HA_ERR_NO_WAIT_LOCK = 203;
  exports.HA_ERR_DISK_FULL_NOWAIT = 204;
  exports.HA_ERR_NO_SESSION_TEMP = 205;
  exports.HA_ERR_WRONG_TABLE_NAME = 206;
  exports.HA_ERR_TOO_LONG_PATH = 207;
  exports.HA_ERR_SAMPLING_INIT_FAILED = 208;
  exports.HA_ERR_FTS_TOO_MANY_NESTED_EXP = 209;
  exports.ER_HASHCHK = 1e3;
  exports.ER_NISAMCHK = 1001;
  exports.ER_NO = 1002;
  exports.ER_YES = 1003;
  exports.ER_CANT_CREATE_FILE = 1004;
  exports.ER_CANT_CREATE_TABLE = 1005;
  exports.ER_CANT_CREATE_DB = 1006;
  exports.ER_DB_CREATE_EXISTS = 1007;
  exports.ER_DB_DROP_EXISTS = 1008;
  exports.ER_DB_DROP_DELETE = 1009;
  exports.ER_DB_DROP_RMDIR = 1010;
  exports.ER_CANT_DELETE_FILE = 1011;
  exports.ER_CANT_FIND_SYSTEM_REC = 1012;
  exports.ER_CANT_GET_STAT = 1013;
  exports.ER_CANT_GET_WD = 1014;
  exports.ER_CANT_LOCK = 1015;
  exports.ER_CANT_OPEN_FILE = 1016;
  exports.ER_FILE_NOT_FOUND = 1017;
  exports.ER_CANT_READ_DIR = 1018;
  exports.ER_CANT_SET_WD = 1019;
  exports.ER_CHECKREAD = 1020;
  exports.ER_DISK_FULL = 1021;
  exports.ER_DUP_KEY = 1022;
  exports.ER_ERROR_ON_CLOSE = 1023;
  exports.ER_ERROR_ON_READ = 1024;
  exports.ER_ERROR_ON_RENAME = 1025;
  exports.ER_ERROR_ON_WRITE = 1026;
  exports.ER_FILE_USED = 1027;
  exports.ER_FILSORT_ABORT = 1028;
  exports.ER_FORM_NOT_FOUND = 1029;
  exports.ER_GET_ERRNO = 1030;
  exports.ER_ILLEGAL_HA = 1031;
  exports.ER_KEY_NOT_FOUND = 1032;
  exports.ER_NOT_FORM_FILE = 1033;
  exports.ER_NOT_KEYFILE = 1034;
  exports.ER_OLD_KEYFILE = 1035;
  exports.ER_OPEN_AS_READONLY = 1036;
  exports.ER_OUTOFMEMORY = 1037;
  exports.ER_OUT_OF_SORTMEMORY = 1038;
  exports.ER_UNEXPECTED_EOF = 1039;
  exports.ER_CON_COUNT_ERROR = 1040;
  exports.ER_OUT_OF_RESOURCES = 1041;
  exports.ER_BAD_HOST_ERROR = 1042;
  exports.ER_HANDSHAKE_ERROR = 1043;
  exports.ER_DBACCESS_DENIED_ERROR = 1044;
  exports.ER_ACCESS_DENIED_ERROR = 1045;
  exports.ER_NO_DB_ERROR = 1046;
  exports.ER_UNKNOWN_COM_ERROR = 1047;
  exports.ER_BAD_NULL_ERROR = 1048;
  exports.ER_BAD_DB_ERROR = 1049;
  exports.ER_TABLE_EXISTS_ERROR = 1050;
  exports.ER_BAD_TABLE_ERROR = 1051;
  exports.ER_NON_UNIQ_ERROR = 1052;
  exports.ER_SERVER_SHUTDOWN = 1053;
  exports.ER_BAD_FIELD_ERROR = 1054;
  exports.ER_WRONG_FIELD_WITH_GROUP = 1055;
  exports.ER_WRONG_GROUP_FIELD = 1056;
  exports.ER_WRONG_SUM_SELECT = 1057;
  exports.ER_WRONG_VALUE_COUNT = 1058;
  exports.ER_TOO_LONG_IDENT = 1059;
  exports.ER_DUP_FIELDNAME = 1060;
  exports.ER_DUP_KEYNAME = 1061;
  exports.ER_DUP_ENTRY = 1062;
  exports.ER_WRONG_FIELD_SPEC = 1063;
  exports.ER_PARSE_ERROR = 1064;
  exports.ER_EMPTY_QUERY = 1065;
  exports.ER_NONUNIQ_TABLE = 1066;
  exports.ER_INVALID_DEFAULT = 1067;
  exports.ER_MULTIPLE_PRI_KEY = 1068;
  exports.ER_TOO_MANY_KEYS = 1069;
  exports.ER_TOO_MANY_KEY_PARTS = 1070;
  exports.ER_TOO_LONG_KEY = 1071;
  exports.ER_KEY_COLUMN_DOES_NOT_EXITS = 1072;
  exports.ER_BLOB_USED_AS_KEY = 1073;
  exports.ER_TOO_BIG_FIELDLENGTH = 1074;
  exports.ER_WRONG_AUTO_KEY = 1075;
  exports.ER_READY = 1076;
  exports.ER_NORMAL_SHUTDOWN = 1077;
  exports.ER_GOT_SIGNAL = 1078;
  exports.ER_SHUTDOWN_COMPLETE = 1079;
  exports.ER_FORCING_CLOSE = 1080;
  exports.ER_IPSOCK_ERROR = 1081;
  exports.ER_NO_SUCH_INDEX = 1082;
  exports.ER_WRONG_FIELD_TERMINATORS = 1083;
  exports.ER_BLOBS_AND_NO_TERMINATED = 1084;
  exports.ER_TEXTFILE_NOT_READABLE = 1085;
  exports.ER_FILE_EXISTS_ERROR = 1086;
  exports.ER_LOAD_INFO = 1087;
  exports.ER_ALTER_INFO = 1088;
  exports.ER_WRONG_SUB_KEY = 1089;
  exports.ER_CANT_REMOVE_ALL_FIELDS = 1090;
  exports.ER_CANT_DROP_FIELD_OR_KEY = 1091;
  exports.ER_INSERT_INFO = 1092;
  exports.ER_UPDATE_TABLE_USED = 1093;
  exports.ER_NO_SUCH_THREAD = 1094;
  exports.ER_KILL_DENIED_ERROR = 1095;
  exports.ER_NO_TABLES_USED = 1096;
  exports.ER_TOO_BIG_SET = 1097;
  exports.ER_NO_UNIQUE_LOGFILE = 1098;
  exports.ER_TABLE_NOT_LOCKED_FOR_WRITE = 1099;
  exports.ER_TABLE_NOT_LOCKED = 1100;
  exports.ER_BLOB_CANT_HAVE_DEFAULT = 1101;
  exports.ER_WRONG_DB_NAME = 1102;
  exports.ER_WRONG_TABLE_NAME = 1103;
  exports.ER_TOO_BIG_SELECT = 1104;
  exports.ER_UNKNOWN_ERROR = 1105;
  exports.ER_UNKNOWN_PROCEDURE = 1106;
  exports.ER_WRONG_PARAMCOUNT_TO_PROCEDURE = 1107;
  exports.ER_WRONG_PARAMETERS_TO_PROCEDURE = 1108;
  exports.ER_UNKNOWN_TABLE = 1109;
  exports.ER_FIELD_SPECIFIED_TWICE = 1110;
  exports.ER_INVALID_GROUP_FUNC_USE = 1111;
  exports.ER_UNSUPPORTED_EXTENSION = 1112;
  exports.ER_TABLE_MUST_HAVE_COLUMNS = 1113;
  exports.ER_RECORD_FILE_FULL = 1114;
  exports.ER_UNKNOWN_CHARACTER_SET = 1115;
  exports.ER_TOO_MANY_TABLES = 1116;
  exports.ER_TOO_MANY_FIELDS = 1117;
  exports.ER_TOO_BIG_ROWSIZE = 1118;
  exports.ER_STACK_OVERRUN = 1119;
  exports.ER_WRONG_OUTER_JOIN = 1120;
  exports.ER_NULL_COLUMN_IN_INDEX = 1121;
  exports.ER_CANT_FIND_UDF = 1122;
  exports.ER_CANT_INITIALIZE_UDF = 1123;
  exports.ER_UDF_NO_PATHS = 1124;
  exports.ER_UDF_EXISTS = 1125;
  exports.ER_CANT_OPEN_LIBRARY = 1126;
  exports.ER_CANT_FIND_DL_ENTRY = 1127;
  exports.ER_FUNCTION_NOT_DEFINED = 1128;
  exports.ER_HOST_IS_BLOCKED = 1129;
  exports.ER_HOST_NOT_PRIVILEGED = 1130;
  exports.ER_PASSWORD_ANONYMOUS_USER = 1131;
  exports.ER_PASSWORD_NOT_ALLOWED = 1132;
  exports.ER_PASSWORD_NO_MATCH = 1133;
  exports.ER_UPDATE_INFO = 1134;
  exports.ER_CANT_CREATE_THREAD = 1135;
  exports.ER_WRONG_VALUE_COUNT_ON_ROW = 1136;
  exports.ER_CANT_REOPEN_TABLE = 1137;
  exports.ER_INVALID_USE_OF_NULL = 1138;
  exports.ER_REGEXP_ERROR = 1139;
  exports.ER_MIX_OF_GROUP_FUNC_AND_FIELDS = 1140;
  exports.ER_NONEXISTING_GRANT = 1141;
  exports.ER_TABLEACCESS_DENIED_ERROR = 1142;
  exports.ER_COLUMNACCESS_DENIED_ERROR = 1143;
  exports.ER_ILLEGAL_GRANT_FOR_TABLE = 1144;
  exports.ER_GRANT_WRONG_HOST_OR_USER = 1145;
  exports.ER_NO_SUCH_TABLE = 1146;
  exports.ER_NONEXISTING_TABLE_GRANT = 1147;
  exports.ER_NOT_ALLOWED_COMMAND = 1148;
  exports.ER_SYNTAX_ERROR = 1149;
  exports.ER_UNUSED1 = 1150;
  exports.ER_UNUSED2 = 1151;
  exports.ER_ABORTING_CONNECTION = 1152;
  exports.ER_NET_PACKET_TOO_LARGE = 1153;
  exports.ER_NET_READ_ERROR_FROM_PIPE = 1154;
  exports.ER_NET_FCNTL_ERROR = 1155;
  exports.ER_NET_PACKETS_OUT_OF_ORDER = 1156;
  exports.ER_NET_UNCOMPRESS_ERROR = 1157;
  exports.ER_NET_READ_ERROR = 1158;
  exports.ER_NET_READ_INTERRUPTED = 1159;
  exports.ER_NET_ERROR_ON_WRITE = 1160;
  exports.ER_NET_WRITE_INTERRUPTED = 1161;
  exports.ER_TOO_LONG_STRING = 1162;
  exports.ER_TABLE_CANT_HANDLE_BLOB = 1163;
  exports.ER_TABLE_CANT_HANDLE_AUTO_INCREMENT = 1164;
  exports.ER_UNUSED3 = 1165;
  exports.ER_WRONG_COLUMN_NAME = 1166;
  exports.ER_WRONG_KEY_COLUMN = 1167;
  exports.ER_WRONG_MRG_TABLE = 1168;
  exports.ER_DUP_UNIQUE = 1169;
  exports.ER_BLOB_KEY_WITHOUT_LENGTH = 1170;
  exports.ER_PRIMARY_CANT_HAVE_NULL = 1171;
  exports.ER_TOO_MANY_ROWS = 1172;
  exports.ER_REQUIRES_PRIMARY_KEY = 1173;
  exports.ER_NO_RAID_COMPILED = 1174;
  exports.ER_UPDATE_WITHOUT_KEY_IN_SAFE_MODE = 1175;
  exports.ER_KEY_DOES_NOT_EXITS = 1176;
  exports.ER_CHECK_NO_SUCH_TABLE = 1177;
  exports.ER_CHECK_NOT_IMPLEMENTED = 1178;
  exports.ER_CANT_DO_THIS_DURING_AN_TRANSACTION = 1179;
  exports.ER_ERROR_DURING_COMMIT = 1180;
  exports.ER_ERROR_DURING_ROLLBACK = 1181;
  exports.ER_ERROR_DURING_FLUSH_LOGS = 1182;
  exports.ER_ERROR_DURING_CHECKPOINT = 1183;
  exports.ER_NEW_ABORTING_CONNECTION = 1184;
  exports.ER_DUMP_NOT_IMPLEMENTED = 1185;
  exports.ER_FLUSH_MASTER_BINLOG_CLOSED = 1186;
  exports.ER_INDEX_REBUILD = 1187;
  exports.ER_SOURCE = 1188;
  exports.ER_SOURCE_NET_READ = 1189;
  exports.ER_SOURCE_NET_WRITE = 1190;
  exports.ER_FT_MATCHING_KEY_NOT_FOUND = 1191;
  exports.ER_LOCK_OR_ACTIVE_TRANSACTION = 1192;
  exports.ER_UNKNOWN_SYSTEM_VARIABLE = 1193;
  exports.ER_CRASHED_ON_USAGE = 1194;
  exports.ER_CRASHED_ON_REPAIR = 1195;
  exports.ER_WARNING_NOT_COMPLETE_ROLLBACK = 1196;
  exports.ER_TRANS_CACHE_FULL = 1197;
  exports.ER_SLAVE_MUST_STOP = 1198;
  exports.ER_REPLICA_NOT_RUNNING = 1199;
  exports.ER_BAD_REPLICA = 1200;
  exports.ER_CONNECTION_METADATA = 1201;
  exports.ER_REPLICA_THREAD = 1202;
  exports.ER_TOO_MANY_USER_CONNECTIONS = 1203;
  exports.ER_SET_CONSTANTS_ONLY = 1204;
  exports.ER_LOCK_WAIT_TIMEOUT = 1205;
  exports.ER_LOCK_TABLE_FULL = 1206;
  exports.ER_READ_ONLY_TRANSACTION = 1207;
  exports.ER_DROP_DB_WITH_READ_LOCK = 1208;
  exports.ER_CREATE_DB_WITH_READ_LOCK = 1209;
  exports.ER_WRONG_ARGUMENTS = 1210;
  exports.ER_NO_PERMISSION_TO_CREATE_USER = 1211;
  exports.ER_UNION_TABLES_IN_DIFFERENT_DIR = 1212;
  exports.ER_LOCK_DEADLOCK = 1213;
  exports.ER_TABLE_CANT_HANDLE_FT = 1214;
  exports.ER_CANNOT_ADD_FOREIGN = 1215;
  exports.ER_NO_REFERENCED_ROW = 1216;
  exports.ER_ROW_IS_REFERENCED = 1217;
  exports.ER_CONNECT_TO_SOURCE = 1218;
  exports.ER_QUERY_ON_MASTER = 1219;
  exports.ER_ERROR_WHEN_EXECUTING_COMMAND = 1220;
  exports.ER_WRONG_USAGE = 1221;
  exports.ER_WRONG_NUMBER_OF_COLUMNS_IN_SELECT = 1222;
  exports.ER_CANT_UPDATE_WITH_READLOCK = 1223;
  exports.ER_MIXING_NOT_ALLOWED = 1224;
  exports.ER_DUP_ARGUMENT = 1225;
  exports.ER_USER_LIMIT_REACHED = 1226;
  exports.ER_SPECIFIC_ACCESS_DENIED_ERROR = 1227;
  exports.ER_LOCAL_VARIABLE = 1228;
  exports.ER_GLOBAL_VARIABLE = 1229;
  exports.ER_NO_DEFAULT = 1230;
  exports.ER_WRONG_VALUE_FOR_VAR = 1231;
  exports.ER_WRONG_TYPE_FOR_VAR = 1232;
  exports.ER_VAR_CANT_BE_READ = 1233;
  exports.ER_CANT_USE_OPTION_HERE = 1234;
  exports.ER_NOT_SUPPORTED_YET = 1235;
  exports.ER_SOURCE_FATAL_ERROR_READING_BINLOG = 1236;
  exports.ER_REPLICA_IGNORED_TABLE = 1237;
  exports.ER_INCORRECT_GLOBAL_LOCAL_VAR = 1238;
  exports.ER_WRONG_FK_DEF = 1239;
  exports.ER_KEY_REF_DO_NOT_MATCH_TABLE_REF = 1240;
  exports.ER_OPERAND_COLUMNS = 1241;
  exports.ER_SUBQUERY_NO_1_ROW = 1242;
  exports.ER_UNKNOWN_STMT_HANDLER = 1243;
  exports.ER_CORRUPT_HELP_DB = 1244;
  exports.ER_CYCLIC_REFERENCE = 1245;
  exports.ER_AUTO_CONVERT = 1246;
  exports.ER_ILLEGAL_REFERENCE = 1247;
  exports.ER_DERIVED_MUST_HAVE_ALIAS = 1248;
  exports.ER_SELECT_REDUCED = 1249;
  exports.ER_TABLENAME_NOT_ALLOWED_HERE = 1250;
  exports.ER_NOT_SUPPORTED_AUTH_MODE = 1251;
  exports.ER_SPATIAL_CANT_HAVE_NULL = 1252;
  exports.ER_COLLATION_CHARSET_MISMATCH = 1253;
  exports.ER_SLAVE_WAS_RUNNING = 1254;
  exports.ER_SLAVE_WAS_NOT_RUNNING = 1255;
  exports.ER_TOO_BIG_FOR_UNCOMPRESS = 1256;
  exports.ER_ZLIB_Z_MEM_ERROR = 1257;
  exports.ER_ZLIB_Z_BUF_ERROR = 1258;
  exports.ER_ZLIB_Z_DATA_ERROR = 1259;
  exports.ER_CUT_VALUE_GROUP_CONCAT = 1260;
  exports.ER_WARN_TOO_FEW_RECORDS = 1261;
  exports.ER_WARN_TOO_MANY_RECORDS = 1262;
  exports.ER_WARN_NULL_TO_NOTNULL = 1263;
  exports.ER_WARN_DATA_OUT_OF_RANGE = 1264;
  exports.WARN_DATA_TRUNCATED = 1265;
  exports.ER_WARN_USING_OTHER_HANDLER = 1266;
  exports.ER_CANT_AGGREGATE_2COLLATIONS = 1267;
  exports.ER_DROP_USER = 1268;
  exports.ER_REVOKE_GRANTS = 1269;
  exports.ER_CANT_AGGREGATE_3COLLATIONS = 1270;
  exports.ER_CANT_AGGREGATE_NCOLLATIONS = 1271;
  exports.ER_VARIABLE_IS_NOT_STRUCT = 1272;
  exports.ER_UNKNOWN_COLLATION = 1273;
  exports.ER_REPLICA_IGNORED_SSL_PARAMS = 1274;
  exports.ER_SERVER_IS_IN_SECURE_AUTH_MODE = 1275;
  exports.ER_WARN_FIELD_RESOLVED = 1276;
  exports.ER_BAD_REPLICA_UNTIL_COND = 1277;
  exports.ER_MISSING_SKIP_REPLICA = 1278;
  exports.ER_UNTIL_COND_IGNORED = 1279;
  exports.ER_WRONG_NAME_FOR_INDEX = 1280;
  exports.ER_WRONG_NAME_FOR_CATALOG = 1281;
  exports.ER_WARN_QC_RESIZE = 1282;
  exports.ER_BAD_FT_COLUMN = 1283;
  exports.ER_UNKNOWN_KEY_CACHE = 1284;
  exports.ER_WARN_HOSTNAME_WONT_WORK = 1285;
  exports.ER_UNKNOWN_STORAGE_ENGINE = 1286;
  exports.ER_WARN_DEPRECATED_SYNTAX = 1287;
  exports.ER_NON_UPDATABLE_TABLE = 1288;
  exports.ER_FEATURE_DISABLED = 1289;
  exports.ER_OPTION_PREVENTS_STATEMENT = 1290;
  exports.ER_DUPLICATED_VALUE_IN_TYPE = 1291;
  exports.ER_TRUNCATED_WRONG_VALUE = 1292;
  exports.ER_TOO_MUCH_AUTO_TIMESTAMP_COLS = 1293;
  exports.ER_INVALID_ON_UPDATE = 1294;
  exports.ER_UNSUPPORTED_PS = 1295;
  exports.ER_GET_ERRMSG = 1296;
  exports.ER_GET_TEMPORARY_ERRMSG = 1297;
  exports.ER_UNKNOWN_TIME_ZONE = 1298;
  exports.ER_WARN_INVALID_TIMESTAMP = 1299;
  exports.ER_INVALID_CHARACTER_STRING = 1300;
  exports.ER_WARN_ALLOWED_PACKET_OVERFLOWED = 1301;
  exports.ER_CONFLICTING_DECLARATIONS = 1302;
  exports.ER_SP_NO_RECURSIVE_CREATE = 1303;
  exports.ER_SP_ALREADY_EXISTS = 1304;
  exports.ER_SP_DOES_NOT_EXIST = 1305;
  exports.ER_SP_DROP_FAILED = 1306;
  exports.ER_SP_STORE_FAILED = 1307;
  exports.ER_SP_LILABEL_MISMATCH = 1308;
  exports.ER_SP_LABEL_REDEFINE = 1309;
  exports.ER_SP_LABEL_MISMATCH = 1310;
  exports.ER_SP_UNINIT_VAR = 1311;
  exports.ER_SP_BADSELECT = 1312;
  exports.ER_SP_BADRETURN = 1313;
  exports.ER_SP_BADSTATEMENT = 1314;
  exports.ER_UPDATE_LOG_DEPRECATED_IGNORED = 1315;
  exports.ER_UPDATE_LOG_DEPRECATED_TRANSLATED = 1316;
  exports.ER_QUERY_INTERRUPTED = 1317;
  exports.ER_SP_WRONG_NO_OF_ARGS = 1318;
  exports.ER_SP_COND_MISMATCH = 1319;
  exports.ER_SP_NORETURN = 1320;
  exports.ER_SP_NORETURNEND = 1321;
  exports.ER_SP_BAD_CURSOR_QUERY = 1322;
  exports.ER_SP_BAD_CURSOR_SELECT = 1323;
  exports.ER_SP_CURSOR_MISMATCH = 1324;
  exports.ER_SP_CURSOR_ALREADY_OPEN = 1325;
  exports.ER_SP_CURSOR_NOT_OPEN = 1326;
  exports.ER_SP_UNDECLARED_VAR = 1327;
  exports.ER_SP_WRONG_NO_OF_FETCH_ARGS = 1328;
  exports.ER_SP_FETCH_NO_DATA = 1329;
  exports.ER_SP_DUP_PARAM = 1330;
  exports.ER_SP_DUP_VAR = 1331;
  exports.ER_SP_DUP_COND = 1332;
  exports.ER_SP_DUP_CURS = 1333;
  exports.ER_SP_CANT_ALTER = 1334;
  exports.ER_SP_SUBSELECT_NYI = 1335;
  exports.ER_STMT_NOT_ALLOWED_IN_SF_OR_TRG = 1336;
  exports.ER_SP_VARCOND_AFTER_CURSHNDLR = 1337;
  exports.ER_SP_CURSOR_AFTER_HANDLER = 1338;
  exports.ER_SP_CASE_NOT_FOUND = 1339;
  exports.ER_FPARSER_TOO_BIG_FILE = 1340;
  exports.ER_FPARSER_BAD_HEADER = 1341;
  exports.ER_FPARSER_EOF_IN_COMMENT = 1342;
  exports.ER_FPARSER_ERROR_IN_PARAMETER = 1343;
  exports.ER_FPARSER_EOF_IN_UNKNOWN_PARAMETER = 1344;
  exports.ER_VIEW_NO_EXPLAIN = 1345;
  exports.ER_FRM_UNKNOWN_TYPE = 1346;
  exports.ER_WRONG_OBJECT = 1347;
  exports.ER_NONUPDATEABLE_COLUMN = 1348;
  exports.ER_VIEW_SELECT_DERIVED = 1349;
  exports.ER_VIEW_SELECT_CLAUSE = 1350;
  exports.ER_VIEW_SELECT_VARIABLE = 1351;
  exports.ER_VIEW_SELECT_TMPTABLE = 1352;
  exports.ER_VIEW_WRONG_LIST = 1353;
  exports.ER_WARN_VIEW_MERGE = 1354;
  exports.ER_WARN_VIEW_WITHOUT_KEY = 1355;
  exports.ER_VIEW_INVALID = 1356;
  exports.ER_SP_NO_DROP_SP = 1357;
  exports.ER_SP_GOTO_IN_HNDLR = 1358;
  exports.ER_TRG_ALREADY_EXISTS = 1359;
  exports.ER_TRG_DOES_NOT_EXIST = 1360;
  exports.ER_TRG_ON_VIEW_OR_TEMP_TABLE = 1361;
  exports.ER_TRG_CANT_CHANGE_ROW = 1362;
  exports.ER_TRG_NO_SUCH_ROW_IN_TRG = 1363;
  exports.ER_NO_DEFAULT_FOR_FIELD = 1364;
  exports.ER_DIVISION_BY_ZERO = 1365;
  exports.ER_TRUNCATED_WRONG_VALUE_FOR_FIELD = 1366;
  exports.ER_ILLEGAL_VALUE_FOR_TYPE = 1367;
  exports.ER_VIEW_NONUPD_CHECK = 1368;
  exports.ER_VIEW_CHECK_FAILED = 1369;
  exports.ER_PROCACCESS_DENIED_ERROR = 1370;
  exports.ER_RELAY_LOG_FAIL = 1371;
  exports.ER_PASSWD_LENGTH = 1372;
  exports.ER_UNKNOWN_TARGET_BINLOG = 1373;
  exports.ER_IO_ERR_LOG_INDEX_READ = 1374;
  exports.ER_BINLOG_PURGE_PROHIBITED = 1375;
  exports.ER_FSEEK_FAIL = 1376;
  exports.ER_BINLOG_PURGE_FATAL_ERR = 1377;
  exports.ER_LOG_IN_USE = 1378;
  exports.ER_LOG_PURGE_UNKNOWN_ERR = 1379;
  exports.ER_RELAY_LOG_INIT = 1380;
  exports.ER_NO_BINARY_LOGGING = 1381;
  exports.ER_RESERVED_SYNTAX = 1382;
  exports.ER_WSAS_FAILED = 1383;
  exports.ER_DIFF_GROUPS_PROC = 1384;
  exports.ER_NO_GROUP_FOR_PROC = 1385;
  exports.ER_ORDER_WITH_PROC = 1386;
  exports.ER_LOGGING_PROHIBIT_CHANGING_OF = 1387;
  exports.ER_NO_FILE_MAPPING = 1388;
  exports.ER_WRONG_MAGIC = 1389;
  exports.ER_PS_MANY_PARAM = 1390;
  exports.ER_KEY_PART_0 = 1391;
  exports.ER_VIEW_CHECKSUM = 1392;
  exports.ER_VIEW_MULTIUPDATE = 1393;
  exports.ER_VIEW_NO_INSERT_FIELD_LIST = 1394;
  exports.ER_VIEW_DELETE_MERGE_VIEW = 1395;
  exports.ER_CANNOT_USER = 1396;
  exports.ER_XAER_NOTA = 1397;
  exports.ER_XAER_INVAL = 1398;
  exports.ER_XAER_RMFAIL = 1399;
  exports.ER_XAER_OUTSIDE = 1400;
  exports.ER_XAER_RMERR = 1401;
  exports.ER_XA_RBROLLBACK = 1402;
  exports.ER_NONEXISTING_PROC_GRANT = 1403;
  exports.ER_PROC_AUTO_GRANT_FAIL = 1404;
  exports.ER_PROC_AUTO_REVOKE_FAIL = 1405;
  exports.ER_DATA_TOO_LONG = 1406;
  exports.ER_SP_BAD_SQLSTATE = 1407;
  exports.ER_STARTUP = 1408;
  exports.ER_LOAD_FROM_FIXED_SIZE_ROWS_TO_VAR = 1409;
  exports.ER_CANT_CREATE_USER_WITH_GRANT = 1410;
  exports.ER_WRONG_VALUE_FOR_TYPE = 1411;
  exports.ER_TABLE_DEF_CHANGED = 1412;
  exports.ER_SP_DUP_HANDLER = 1413;
  exports.ER_SP_NOT_VAR_ARG = 1414;
  exports.ER_SP_NO_RETSET = 1415;
  exports.ER_CANT_CREATE_GEOMETRY_OBJECT = 1416;
  exports.ER_FAILED_ROUTINE_BREAK_BINLOG = 1417;
  exports.ER_BINLOG_UNSAFE_ROUTINE = 1418;
  exports.ER_BINLOG_CREATE_ROUTINE_NEED_SUPER = 1419;
  exports.ER_EXEC_STMT_WITH_OPEN_CURSOR = 1420;
  exports.ER_STMT_HAS_NO_OPEN_CURSOR = 1421;
  exports.ER_COMMIT_NOT_ALLOWED_IN_SF_OR_TRG = 1422;
  exports.ER_NO_DEFAULT_FOR_VIEW_FIELD = 1423;
  exports.ER_SP_NO_RECURSION = 1424;
  exports.ER_TOO_BIG_SCALE = 1425;
  exports.ER_TOO_BIG_PRECISION = 1426;
  exports.ER_M_BIGGER_THAN_D = 1427;
  exports.ER_WRONG_LOCK_OF_SYSTEM_TABLE = 1428;
  exports.ER_CONNECT_TO_FOREIGN_DATA_SOURCE = 1429;
  exports.ER_QUERY_ON_FOREIGN_DATA_SOURCE = 1430;
  exports.ER_FOREIGN_DATA_SOURCE_DOESNT_EXIST = 1431;
  exports.ER_FOREIGN_DATA_STRING_INVALID_CANT_CREATE = 1432;
  exports.ER_FOREIGN_DATA_STRING_INVALID = 1433;
  exports.ER_CANT_CREATE_FEDERATED_TABLE = 1434;
  exports.ER_TRG_IN_WRONG_SCHEMA = 1435;
  exports.ER_STACK_OVERRUN_NEED_MORE = 1436;
  exports.ER_TOO_LONG_BODY = 1437;
  exports.ER_WARN_CANT_DROP_DEFAULT_KEYCACHE = 1438;
  exports.ER_TOO_BIG_DISPLAYWIDTH = 1439;
  exports.ER_XAER_DUPID = 1440;
  exports.ER_DATETIME_FUNCTION_OVERFLOW = 1441;
  exports.ER_CANT_UPDATE_USED_TABLE_IN_SF_OR_TRG = 1442;
  exports.ER_VIEW_PREVENT_UPDATE = 1443;
  exports.ER_PS_NO_RECURSION = 1444;
  exports.ER_SP_CANT_SET_AUTOCOMMIT = 1445;
  exports.ER_MALFORMED_DEFINER = 1446;
  exports.ER_VIEW_FRM_NO_USER = 1447;
  exports.ER_VIEW_OTHER_USER = 1448;
  exports.ER_NO_SUCH_USER = 1449;
  exports.ER_FORBID_SCHEMA_CHANGE = 1450;
  exports.ER_ROW_IS_REFERENCED_2 = 1451;
  exports.ER_NO_REFERENCED_ROW_2 = 1452;
  exports.ER_SP_BAD_VAR_SHADOW = 1453;
  exports.ER_TRG_NO_DEFINER = 1454;
  exports.ER_OLD_FILE_FORMAT = 1455;
  exports.ER_SP_RECURSION_LIMIT = 1456;
  exports.ER_SP_PROC_TABLE_CORRUPT = 1457;
  exports.ER_SP_WRONG_NAME = 1458;
  exports.ER_TABLE_NEEDS_UPGRADE = 1459;
  exports.ER_SP_NO_AGGREGATE = 1460;
  exports.ER_MAX_PREPARED_STMT_COUNT_REACHED = 1461;
  exports.ER_VIEW_RECURSIVE = 1462;
  exports.ER_NON_GROUPING_FIELD_USED = 1463;
  exports.ER_TABLE_CANT_HANDLE_SPKEYS = 1464;
  exports.ER_NO_TRIGGERS_ON_SYSTEM_SCHEMA = 1465;
  exports.ER_REMOVED_SPACES = 1466;
  exports.ER_AUTOINC_READ_FAILED = 1467;
  exports.ER_USERNAME = 1468;
  exports.ER_HOSTNAME = 1469;
  exports.ER_WRONG_STRING_LENGTH = 1470;
  exports.ER_NON_INSERTABLE_TABLE = 1471;
  exports.ER_ADMIN_WRONG_MRG_TABLE = 1472;
  exports.ER_TOO_HIGH_LEVEL_OF_NESTING_FOR_SELECT = 1473;
  exports.ER_NAME_BECOMES_EMPTY = 1474;
  exports.ER_AMBIGUOUS_FIELD_TERM = 1475;
  exports.ER_FOREIGN_SERVER_EXISTS = 1476;
  exports.ER_FOREIGN_SERVER_DOESNT_EXIST = 1477;
  exports.ER_ILLEGAL_HA_CREATE_OPTION = 1478;
  exports.ER_PARTITION_REQUIRES_VALUES_ERROR = 1479;
  exports.ER_PARTITION_WRONG_VALUES_ERROR = 1480;
  exports.ER_PARTITION_MAXVALUE_ERROR = 1481;
  exports.ER_PARTITION_SUBPARTITION_ERROR = 1482;
  exports.ER_PARTITION_SUBPART_MIX_ERROR = 1483;
  exports.ER_PARTITION_WRONG_NO_PART_ERROR = 1484;
  exports.ER_PARTITION_WRONG_NO_SUBPART_ERROR = 1485;
  exports.ER_WRONG_EXPR_IN_PARTITION_FUNC_ERROR = 1486;
  exports.ER_NO_CONST_EXPR_IN_RANGE_OR_LIST_ERROR = 1487;
  exports.ER_FIELD_NOT_FOUND_PART_ERROR = 1488;
  exports.ER_LIST_OF_FIELDS_ONLY_IN_HASH_ERROR = 1489;
  exports.ER_INCONSISTENT_PARTITION_INFO_ERROR = 1490;
  exports.ER_PARTITION_FUNC_NOT_ALLOWED_ERROR = 1491;
  exports.ER_PARTITIONS_MUST_BE_DEFINED_ERROR = 1492;
  exports.ER_RANGE_NOT_INCREASING_ERROR = 1493;
  exports.ER_INCONSISTENT_TYPE_OF_FUNCTIONS_ERROR = 1494;
  exports.ER_MULTIPLE_DEF_CONST_IN_LIST_PART_ERROR = 1495;
  exports.ER_PARTITION_ENTRY_ERROR = 1496;
  exports.ER_MIX_HANDLER_ERROR = 1497;
  exports.ER_PARTITION_NOT_DEFINED_ERROR = 1498;
  exports.ER_TOO_MANY_PARTITIONS_ERROR = 1499;
  exports.ER_SUBPARTITION_ERROR = 1500;
  exports.ER_CANT_CREATE_HANDLER_FILE = 1501;
  exports.ER_BLOB_FIELD_IN_PART_FUNC_ERROR = 1502;
  exports.ER_UNIQUE_KEY_NEED_ALL_FIELDS_IN_PF = 1503;
  exports.ER_NO_PARTS_ERROR = 1504;
  exports.ER_PARTITION_MGMT_ON_NONPARTITIONED = 1505;
  exports.ER_FOREIGN_KEY_ON_PARTITIONED = 1506;
  exports.ER_DROP_PARTITION_NON_EXISTENT = 1507;
  exports.ER_DROP_LAST_PARTITION = 1508;
  exports.ER_COALESCE_ONLY_ON_HASH_PARTITION = 1509;
  exports.ER_REORG_HASH_ONLY_ON_SAME_NO = 1510;
  exports.ER_REORG_NO_PARAM_ERROR = 1511;
  exports.ER_ONLY_ON_RANGE_LIST_PARTITION = 1512;
  exports.ER_ADD_PARTITION_SUBPART_ERROR = 1513;
  exports.ER_ADD_PARTITION_NO_NEW_PARTITION = 1514;
  exports.ER_COALESCE_PARTITION_NO_PARTITION = 1515;
  exports.ER_REORG_PARTITION_NOT_EXIST = 1516;
  exports.ER_SAME_NAME_PARTITION = 1517;
  exports.ER_NO_BINLOG_ERROR = 1518;
  exports.ER_CONSECUTIVE_REORG_PARTITIONS = 1519;
  exports.ER_REORG_OUTSIDE_RANGE = 1520;
  exports.ER_PARTITION_FUNCTION_FAILURE = 1521;
  exports.ER_PART_STATE_ERROR = 1522;
  exports.ER_LIMITED_PART_RANGE = 1523;
  exports.ER_PLUGIN_IS_NOT_LOADED = 1524;
  exports.ER_WRONG_VALUE = 1525;
  exports.ER_NO_PARTITION_FOR_GIVEN_VALUE = 1526;
  exports.ER_FILEGROUP_OPTION_ONLY_ONCE = 1527;
  exports.ER_CREATE_FILEGROUP_FAILED = 1528;
  exports.ER_DROP_FILEGROUP_FAILED = 1529;
  exports.ER_TABLESPACE_AUTO_EXTEND_ERROR = 1530;
  exports.ER_WRONG_SIZE_NUMBER = 1531;
  exports.ER_SIZE_OVERFLOW_ERROR = 1532;
  exports.ER_ALTER_FILEGROUP_FAILED = 1533;
  exports.ER_BINLOG_ROW_LOGGING_FAILED = 1534;
  exports.ER_BINLOG_ROW_WRONG_TABLE_DEF = 1535;
  exports.ER_BINLOG_ROW_RBR_TO_SBR = 1536;
  exports.ER_EVENT_ALREADY_EXISTS = 1537;
  exports.ER_EVENT_STORE_FAILED = 1538;
  exports.ER_EVENT_DOES_NOT_EXIST = 1539;
  exports.ER_EVENT_CANT_ALTER = 1540;
  exports.ER_EVENT_DROP_FAILED = 1541;
  exports.ER_EVENT_INTERVAL_NOT_POSITIVE_OR_TOO_BIG = 1542;
  exports.ER_EVENT_ENDS_BEFORE_STARTS = 1543;
  exports.ER_EVENT_EXEC_TIME_IN_THE_PAST = 1544;
  exports.ER_EVENT_OPEN_TABLE_FAILED = 1545;
  exports.ER_EVENT_NEITHER_M_EXPR_NOR_M_AT = 1546;
  exports.ER_COL_COUNT_DOESNT_MATCH_CORRUPTED = 1547;
  exports.ER_CANNOT_LOAD_FROM_TABLE = 1548;
  exports.ER_EVENT_CANNOT_DELETE = 1549;
  exports.ER_EVENT_COMPILE_ERROR = 1550;
  exports.ER_EVENT_SAME_NAME = 1551;
  exports.ER_EVENT_DATA_TOO_LONG = 1552;
  exports.ER_DROP_INDEX_FK = 1553;
  exports.ER_WARN_DEPRECATED_SYNTAX_WITH_VER = 1554;
  exports.ER_CANT_WRITE_LOCK_LOG_TABLE = 1555;
  exports.ER_CANT_LOCK_LOG_TABLE = 1556;
  exports.ER_FOREIGN_DUPLICATE_KEY = 1557;
  exports.ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE = 1558;
  exports.ER_TEMP_TABLE_PREVENTS_SWITCH_OUT_OF_RBR = 1559;
  exports.ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_FORMAT = 1560;
  exports.ER_NDB_CANT_SWITCH_BINLOG_FORMAT = 1561;
  exports.ER_PARTITION_NO_TEMPORARY = 1562;
  exports.ER_PARTITION_CONST_DOMAIN_ERROR = 1563;
  exports.ER_PARTITION_FUNCTION_IS_NOT_ALLOWED = 1564;
  exports.ER_DDL_LOG_ERROR = 1565;
  exports.ER_NULL_IN_VALUES_LESS_THAN = 1566;
  exports.ER_WRONG_PARTITION_NAME = 1567;
  exports.ER_CANT_CHANGE_TX_CHARACTERISTICS = 1568;
  exports.ER_DUP_ENTRY_AUTOINCREMENT_CASE = 1569;
  exports.ER_EVENT_MODIFY_QUEUE_ERROR = 1570;
  exports.ER_EVENT_SET_VAR_ERROR = 1571;
  exports.ER_PARTITION_MERGE_ERROR = 1572;
  exports.ER_CANT_ACTIVATE_LOG = 1573;
  exports.ER_RBR_NOT_AVAILABLE = 1574;
  exports.ER_BASE64_DECODE_ERROR = 1575;
  exports.ER_EVENT_RECURSION_FORBIDDEN = 1576;
  exports.ER_EVENTS_DB_ERROR = 1577;
  exports.ER_ONLY_INTEGERS_ALLOWED = 1578;
  exports.ER_UNSUPORTED_LOG_ENGINE = 1579;
  exports.ER_BAD_LOG_STATEMENT = 1580;
  exports.ER_CANT_RENAME_LOG_TABLE = 1581;
  exports.ER_WRONG_PARAMCOUNT_TO_NATIVE_FCT = 1582;
  exports.ER_WRONG_PARAMETERS_TO_NATIVE_FCT = 1583;
  exports.ER_WRONG_PARAMETERS_TO_STORED_FCT = 1584;
  exports.ER_NATIVE_FCT_NAME_COLLISION = 1585;
  exports.ER_DUP_ENTRY_WITH_KEY_NAME = 1586;
  exports.ER_BINLOG_PURGE_EMFILE = 1587;
  exports.ER_EVENT_CANNOT_CREATE_IN_THE_PAST = 1588;
  exports.ER_EVENT_CANNOT_ALTER_IN_THE_PAST = 1589;
  exports.ER_SLAVE_INCIDENT = 1590;
  exports.ER_NO_PARTITION_FOR_GIVEN_VALUE_SILENT = 1591;
  exports.ER_BINLOG_UNSAFE_STATEMENT = 1592;
  exports.ER_BINLOG_FATAL_ERROR = 1593;
  exports.ER_SLAVE_RELAY_LOG_READ_FAILURE = 1594;
  exports.ER_SLAVE_RELAY_LOG_WRITE_FAILURE = 1595;
  exports.ER_SLAVE_CREATE_EVENT_FAILURE = 1596;
  exports.ER_SLAVE_MASTER_COM_FAILURE = 1597;
  exports.ER_BINLOG_LOGGING_IMPOSSIBLE = 1598;
  exports.ER_VIEW_NO_CREATION_CTX = 1599;
  exports.ER_VIEW_INVALID_CREATION_CTX = 1600;
  exports.ER_SR_INVALID_CREATION_CTX = 1601;
  exports.ER_TRG_CORRUPTED_FILE = 1602;
  exports.ER_TRG_NO_CREATION_CTX = 1603;
  exports.ER_TRG_INVALID_CREATION_CTX = 1604;
  exports.ER_EVENT_INVALID_CREATION_CTX = 1605;
  exports.ER_TRG_CANT_OPEN_TABLE = 1606;
  exports.ER_CANT_CREATE_SROUTINE = 1607;
  exports.ER_NEVER_USED = 1608;
  exports.ER_NO_FORMAT_DESCRIPTION_EVENT_BEFORE_BINLOG_STATEMENT = 1609;
  exports.ER_REPLICA_CORRUPT_EVENT = 1610;
  exports.ER_LOAD_DATA_INVALID_COLUMN = 1611;
  exports.ER_LOG_PURGE_NO_FILE = 1612;
  exports.ER_XA_RBTIMEOUT = 1613;
  exports.ER_XA_RBDEADLOCK = 1614;
  exports.ER_NEED_REPREPARE = 1615;
  exports.ER_DELAYED_NOT_SUPPORTED = 1616;
  exports.WARN_NO_CONNECTION_METADATA = 1617;
  exports.WARN_OPTION_IGNORED = 1618;
  exports.ER_PLUGIN_DELETE_BUILTIN = 1619;
  exports.WARN_PLUGIN_BUSY = 1620;
  exports.ER_VARIABLE_IS_READONLY = 1621;
  exports.ER_WARN_ENGINE_TRANSACTION_ROLLBACK = 1622;
  exports.ER_SLAVE_HEARTBEAT_FAILURE = 1623;
  exports.ER_REPLICA_HEARTBEAT_VALUE_OUT_OF_RANGE = 1624;
  exports.ER_NDB_REPLICATION_SCHEMA_ERROR = 1625;
  exports.ER_CONFLICT_FN_PARSE_ERROR = 1626;
  exports.ER_EXCEPTIONS_WRITE_ERROR = 1627;
  exports.ER_TOO_LONG_TABLE_COMMENT = 1628;
  exports.ER_TOO_LONG_FIELD_COMMENT = 1629;
  exports.ER_FUNC_INEXISTENT_NAME_COLLISION = 1630;
  exports.ER_DATABASE_NAME = 1631;
  exports.ER_TABLE_NAME = 1632;
  exports.ER_PARTITION_NAME = 1633;
  exports.ER_SUBPARTITION_NAME = 1634;
  exports.ER_TEMPORARY_NAME = 1635;
  exports.ER_RENAMED_NAME = 1636;
  exports.ER_TOO_MANY_CONCURRENT_TRXS = 1637;
  exports.WARN_NON_ASCII_SEPARATOR_NOT_IMPLEMENTED = 1638;
  exports.ER_DEBUG_SYNC_TIMEOUT = 1639;
  exports.ER_DEBUG_SYNC_HIT_LIMIT = 1640;
  exports.ER_DUP_SIGNAL_SET = 1641;
  exports.ER_SIGNAL_WARN = 1642;
  exports.ER_SIGNAL_NOT_FOUND = 1643;
  exports.ER_SIGNAL_EXCEPTION = 1644;
  exports.ER_RESIGNAL_WITHOUT_ACTIVE_HANDLER = 1645;
  exports.ER_SIGNAL_BAD_CONDITION_TYPE = 1646;
  exports.WARN_COND_ITEM_TRUNCATED = 1647;
  exports.ER_COND_ITEM_TOO_LONG = 1648;
  exports.ER_UNKNOWN_LOCALE = 1649;
  exports.ER_REPLICA_IGNORE_SERVER_IDS = 1650;
  exports.ER_QUERY_CACHE_DISABLED = 1651;
  exports.ER_SAME_NAME_PARTITION_FIELD = 1652;
  exports.ER_PARTITION_COLUMN_LIST_ERROR = 1653;
  exports.ER_WRONG_TYPE_COLUMN_VALUE_ERROR = 1654;
  exports.ER_TOO_MANY_PARTITION_FUNC_FIELDS_ERROR = 1655;
  exports.ER_MAXVALUE_IN_VALUES_IN = 1656;
  exports.ER_TOO_MANY_VALUES_ERROR = 1657;
  exports.ER_ROW_SINGLE_PARTITION_FIELD_ERROR = 1658;
  exports.ER_FIELD_TYPE_NOT_ALLOWED_AS_PARTITION_FIELD = 1659;
  exports.ER_PARTITION_FIELDS_TOO_LONG = 1660;
  exports.ER_BINLOG_ROW_ENGINE_AND_STMT_ENGINE = 1661;
  exports.ER_BINLOG_ROW_MODE_AND_STMT_ENGINE = 1662;
  exports.ER_BINLOG_UNSAFE_AND_STMT_ENGINE = 1663;
  exports.ER_BINLOG_ROW_INJECTION_AND_STMT_ENGINE = 1664;
  exports.ER_BINLOG_STMT_MODE_AND_ROW_ENGINE = 1665;
  exports.ER_BINLOG_ROW_INJECTION_AND_STMT_MODE = 1666;
  exports.ER_BINLOG_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE = 1667;
  exports.ER_BINLOG_UNSAFE_LIMIT = 1668;
  exports.ER_UNUSED4 = 1669;
  exports.ER_BINLOG_UNSAFE_SYSTEM_TABLE = 1670;
  exports.ER_BINLOG_UNSAFE_AUTOINC_COLUMNS = 1671;
  exports.ER_BINLOG_UNSAFE_UDF = 1672;
  exports.ER_BINLOG_UNSAFE_SYSTEM_VARIABLE = 1673;
  exports.ER_BINLOG_UNSAFE_SYSTEM_FUNCTION = 1674;
  exports.ER_BINLOG_UNSAFE_NONTRANS_AFTER_TRANS = 1675;
  exports.ER_MESSAGE_AND_STATEMENT = 1676;
  exports.ER_SLAVE_CONVERSION_FAILED = 1677;
  exports.ER_REPLICA_CANT_CREATE_CONVERSION = 1678;
  exports.ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_FORMAT = 1679;
  exports.ER_PATH_LENGTH = 1680;
  exports.ER_WARN_DEPRECATED_SYNTAX_NO_REPLACEMENT = 1681;
  exports.ER_WRONG_NATIVE_TABLE_STRUCTURE = 1682;
  exports.ER_WRONG_PERFSCHEMA_USAGE = 1683;
  exports.ER_WARN_I_S_SKIPPED_TABLE = 1684;
  exports.ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_DIRECT = 1685;
  exports.ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_DIRECT = 1686;
  exports.ER_SPATIAL_MUST_HAVE_GEOM_COL = 1687;
  exports.ER_TOO_LONG_INDEX_COMMENT = 1688;
  exports.ER_LOCK_ABORTED = 1689;
  exports.ER_DATA_OUT_OF_RANGE = 1690;
  exports.ER_WRONG_SPVAR_TYPE_IN_LIMIT = 1691;
  exports.ER_BINLOG_UNSAFE_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE = 1692;
  exports.ER_BINLOG_UNSAFE_MIXED_STATEMENT = 1693;
  exports.ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_SQL_LOG_BIN = 1694;
  exports.ER_STORED_FUNCTION_PREVENTS_SWITCH_SQL_LOG_BIN = 1695;
  exports.ER_FAILED_READ_FROM_PAR_FILE = 1696;
  exports.ER_VALUES_IS_NOT_INT_TYPE_ERROR = 1697;
  exports.ER_ACCESS_DENIED_NO_PASSWORD_ERROR = 1698;
  exports.ER_SET_PASSWORD_AUTH_PLUGIN = 1699;
  exports.ER_GRANT_PLUGIN_USER_EXISTS = 1700;
  exports.ER_TRUNCATE_ILLEGAL_FK = 1701;
  exports.ER_PLUGIN_IS_PERMANENT = 1702;
  exports.ER_REPLICA_HEARTBEAT_VALUE_OUT_OF_RANGE_MIN = 1703;
  exports.ER_REPLICA_HEARTBEAT_VALUE_OUT_OF_RANGE_MAX = 1704;
  exports.ER_STMT_CACHE_FULL = 1705;
  exports.ER_MULTI_UPDATE_KEY_CONFLICT = 1706;
  exports.ER_TABLE_NEEDS_REBUILD = 1707;
  exports.WARN_OPTION_BELOW_LIMIT = 1708;
  exports.ER_INDEX_COLUMN_TOO_LONG = 1709;
  exports.ER_ERROR_IN_TRIGGER_BODY = 1710;
  exports.ER_ERROR_IN_UNKNOWN_TRIGGER_BODY = 1711;
  exports.ER_INDEX_CORRUPT = 1712;
  exports.ER_UNDO_RECORD_TOO_BIG = 1713;
  exports.ER_BINLOG_UNSAFE_INSERT_IGNORE_SELECT = 1714;
  exports.ER_BINLOG_UNSAFE_INSERT_SELECT_UPDATE = 1715;
  exports.ER_BINLOG_UNSAFE_REPLACE_SELECT = 1716;
  exports.ER_BINLOG_UNSAFE_CREATE_IGNORE_SELECT = 1717;
  exports.ER_BINLOG_UNSAFE_CREATE_REPLACE_SELECT = 1718;
  exports.ER_BINLOG_UNSAFE_UPDATE_IGNORE = 1719;
  exports.ER_PLUGIN_NO_UNINSTALL = 1720;
  exports.ER_PLUGIN_NO_INSTALL = 1721;
  exports.ER_BINLOG_UNSAFE_WRITE_AUTOINC_SELECT = 1722;
  exports.ER_BINLOG_UNSAFE_CREATE_SELECT_AUTOINC = 1723;
  exports.ER_BINLOG_UNSAFE_INSERT_TWO_KEYS = 1724;
  exports.ER_TABLE_IN_FK_CHECK = 1725;
  exports.ER_UNSUPPORTED_ENGINE = 1726;
  exports.ER_BINLOG_UNSAFE_AUTOINC_NOT_FIRST = 1727;
  exports.ER_CANNOT_LOAD_FROM_TABLE_V2 = 1728;
  exports.ER_SOURCE_DELAY_VALUE_OUT_OF_RANGE = 1729;
  exports.ER_ONLY_FD_AND_RBR_EVENTS_ALLOWED_IN_BINLOG_STATEMENT = 1730;
  exports.ER_PARTITION_EXCHANGE_DIFFERENT_OPTION = 1731;
  exports.ER_PARTITION_EXCHANGE_PART_TABLE = 1732;
  exports.ER_PARTITION_EXCHANGE_TEMP_TABLE = 1733;
  exports.ER_PARTITION_INSTEAD_OF_SUBPARTITION = 1734;
  exports.ER_UNKNOWN_PARTITION = 1735;
  exports.ER_TABLES_DIFFERENT_METADATA = 1736;
  exports.ER_ROW_DOES_NOT_MATCH_PARTITION = 1737;
  exports.ER_BINLOG_CACHE_SIZE_GREATER_THAN_MAX = 1738;
  exports.ER_WARN_INDEX_NOT_APPLICABLE = 1739;
  exports.ER_PARTITION_EXCHANGE_FOREIGN_KEY = 1740;
  exports.ER_NO_SUCH_KEY_VALUE = 1741;
  exports.ER_RPL_INFO_DATA_TOO_LONG = 1742;
  exports.ER_NETWORK_READ_EVENT_CHECKSUM_FAILURE = 1743;
  exports.ER_BINLOG_READ_EVENT_CHECKSUM_FAILURE = 1744;
  exports.ER_BINLOG_STMT_CACHE_SIZE_GREATER_THAN_MAX = 1745;
  exports.ER_CANT_UPDATE_TABLE_IN_CREATE_TABLE_SELECT = 1746;
  exports.ER_PARTITION_CLAUSE_ON_NONPARTITIONED = 1747;
  exports.ER_ROW_DOES_NOT_MATCH_GIVEN_PARTITION_SET = 1748;
  exports.ER_NO_SUCH_PARTITION = 1749;
  exports.ER_CHANGE_RPL_INFO_REPOSITORY_FAILURE = 1750;
  exports.ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_CREATED_TEMP_TABLE = 1751;
  exports.ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_DROPPED_TEMP_TABLE = 1752;
  exports.ER_MTA_FEATURE_IS_NOT_SUPPORTED = 1753;
  exports.ER_MTA_UPDATED_DBS_GREATER_MAX = 1754;
  exports.ER_MTA_CANT_PARALLEL = 1755;
  exports.ER_MTA_INCONSISTENT_DATA = 1756;
  exports.ER_FULLTEXT_NOT_SUPPORTED_WITH_PARTITIONING = 1757;
  exports.ER_DA_INVALID_CONDITION_NUMBER = 1758;
  exports.ER_INSECURE_PLAIN_TEXT = 1759;
  exports.ER_INSECURE_CHANGE_SOURCE = 1760;
  exports.ER_FOREIGN_DUPLICATE_KEY_WITH_CHILD_INFO = 1761;
  exports.ER_FOREIGN_DUPLICATE_KEY_WITHOUT_CHILD_INFO = 1762;
  exports.ER_SQLTHREAD_WITH_SECURE_REPLICA = 1763;
  exports.ER_TABLE_HAS_NO_FT = 1764;
  exports.ER_VARIABLE_NOT_SETTABLE_IN_SF_OR_TRIGGER = 1765;
  exports.ER_VARIABLE_NOT_SETTABLE_IN_TRANSACTION = 1766;
  exports.ER_GTID_NEXT_IS_NOT_IN_GTID_NEXT_LIST = 1767;
  exports.ER_CANT_CHANGE_GTID_NEXT_IN_TRANSACTION = 1768;
  exports.ER_SET_STATEMENT_CANNOT_INVOKE_FUNCTION = 1769;
  exports.ER_GTID_NEXT_CANT_BE_AUTOMATIC_IF_GTID_NEXT_LIST_IS_NON_NULL = 1770;
  exports.ER_SKIPPING_LOGGED_TRANSACTION = 1771;
  exports.ER_MALFORMED_GTID_SET_SPECIFICATION = 1772;
  exports.ER_MALFORMED_GTID_SET_ENCODING = 1773;
  exports.ER_MALFORMED_GTID_SPECIFICATION = 1774;
  exports.ER_GNO_EXHAUSTED = 1775;
  exports.ER_BAD_REPLICA_AUTO_POSITION = 1776;
  exports.ER_AUTO_POSITION_REQUIRES_GTID_MODE_NOT_OFF = 1777;
  exports.ER_CANT_DO_IMPLICIT_COMMIT_IN_TRX_WHEN_GTID_NEXT_IS_SET = 1778;
  exports.ER_GTID_MODE_ON_REQUIRES_ENFORCE_GTID_CONSISTENCY_ON = 1779;
  exports.ER_GTID_MODE_REQUIRES_BINLOG = 1780;
  exports.ER_CANT_SET_GTID_NEXT_TO_GTID_WHEN_GTID_MODE_IS_OFF = 1781;
  exports.ER_CANT_SET_GTID_NEXT_TO_ANONYMOUS_WHEN_GTID_MODE_IS_ON = 1782;
  exports.ER_CANT_SET_GTID_NEXT_LIST_TO_NON_NULL_WHEN_GTID_MODE_IS_OFF = 1783;
  exports.ER_FOUND_GTID_EVENT_WHEN_GTID_MODE_IS_OFF = 1784;
  exports.ER_GTID_UNSAFE_NON_TRANSACTIONAL_TABLE = 1785;
  exports.ER_GTID_UNSAFE_CREATE_SELECT = 1786;
  exports.ER_GTID_UNSAFE_CREATE_DROP_TEMP_TABLE_IN_TRANSACTION = 1787;
  exports.ER_GTID_MODE_CAN_ONLY_CHANGE_ONE_STEP_AT_A_TIME = 1788;
  exports.ER_SOURCE_HAS_PURGED_REQUIRED_GTIDS = 1789;
  exports.ER_CANT_SET_GTID_NEXT_WHEN_OWNING_GTID = 1790;
  exports.ER_UNKNOWN_EXPLAIN_FORMAT = 1791;
  exports.ER_CANT_EXECUTE_IN_READ_ONLY_TRANSACTION = 1792;
  exports.ER_TOO_LONG_TABLE_PARTITION_COMMENT = 1793;
  exports.ER_REPLICA_CONFIGURATION = 1794;
  exports.ER_INNODB_FT_LIMIT = 1795;
  exports.ER_INNODB_NO_FT_TEMP_TABLE = 1796;
  exports.ER_INNODB_FT_WRONG_DOCID_COLUMN = 1797;
  exports.ER_INNODB_FT_WRONG_DOCID_INDEX = 1798;
  exports.ER_INNODB_ONLINE_LOG_TOO_BIG = 1799;
  exports.ER_UNKNOWN_ALTER_ALGORITHM = 1800;
  exports.ER_UNKNOWN_ALTER_LOCK = 1801;
  exports.ER_MTA_CHANGE_SOURCE_CANT_RUN_WITH_GAPS = 1802;
  exports.ER_MTA_RECOVERY_FAILURE = 1803;
  exports.ER_MTA_RESET_WORKERS = 1804;
  exports.ER_COL_COUNT_DOESNT_MATCH_CORRUPTED_V2 = 1805;
  exports.ER_REPLICA_SILENT_RETRY_TRANSACTION = 1806;
  exports.ER_DISCARD_FK_CHECKS_RUNNING = 1807;
  exports.ER_TABLE_SCHEMA_MISMATCH = 1808;
  exports.ER_TABLE_IN_SYSTEM_TABLESPACE = 1809;
  exports.ER_IO_READ_ERROR = 1810;
  exports.ER_IO_WRITE_ERROR = 1811;
  exports.ER_TABLESPACE_MISSING = 1812;
  exports.ER_TABLESPACE_EXISTS = 1813;
  exports.ER_TABLESPACE_DISCARDED = 1814;
  exports.ER_INTERNAL_ERROR = 1815;
  exports.ER_INNODB_IMPORT_ERROR = 1816;
  exports.ER_INNODB_INDEX_CORRUPT = 1817;
  exports.ER_INVALID_YEAR_COLUMN_LENGTH = 1818;
  exports.ER_NOT_VALID_PASSWORD = 1819;
  exports.ER_MUST_CHANGE_PASSWORD = 1820;
  exports.ER_FK_NO_INDEX_CHILD = 1821;
  exports.ER_FK_NO_INDEX_PARENT = 1822;
  exports.ER_FK_FAIL_ADD_SYSTEM = 1823;
  exports.ER_FK_CANNOT_OPEN_PARENT = 1824;
  exports.ER_FK_INCORRECT_OPTION = 1825;
  exports.ER_FK_DUP_NAME = 1826;
  exports.ER_PASSWORD_FORMAT = 1827;
  exports.ER_FK_COLUMN_CANNOT_DROP = 1828;
  exports.ER_FK_COLUMN_CANNOT_DROP_CHILD = 1829;
  exports.ER_FK_COLUMN_NOT_NULL = 1830;
  exports.ER_DUP_INDEX = 1831;
  exports.ER_FK_COLUMN_CANNOT_CHANGE = 1832;
  exports.ER_FK_COLUMN_CANNOT_CHANGE_CHILD = 1833;
  exports.ER_UNUSED5 = 1834;
  exports.ER_MALFORMED_PACKET = 1835;
  exports.ER_READ_ONLY_MODE = 1836;
  exports.ER_GTID_NEXT_TYPE_UNDEFINED_GTID = 1837;
  exports.ER_VARIABLE_NOT_SETTABLE_IN_SP = 1838;
  exports.ER_CANT_SET_GTID_PURGED_WHEN_GTID_MODE_IS_OFF = 1839;
  exports.ER_CANT_SET_GTID_PURGED_WHEN_GTID_EXECUTED_IS_NOT_EMPTY = 1840;
  exports.ER_CANT_SET_GTID_PURGED_WHEN_OWNED_GTIDS_IS_NOT_EMPTY = 1841;
  exports.ER_GTID_PURGED_WAS_CHANGED = 1842;
  exports.ER_GTID_EXECUTED_WAS_CHANGED = 1843;
  exports.ER_BINLOG_STMT_MODE_AND_NO_REPL_TABLES = 1844;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED = 1845;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON = 1846;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COPY = 1847;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_PARTITION = 1848;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_RENAME = 1849;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COLUMN_TYPE = 1850;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_CHECK = 1851;
  exports.ER_UNUSED6 = 1852;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOPK = 1853;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_AUTOINC = 1854;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_HIDDEN_FTS = 1855;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_CHANGE_FTS = 1856;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FTS = 1857;
  exports.ER_SQL_REPLICA_SKIP_COUNTER_NOT_SETTABLE_IN_GTID_MODE = 1858;
  exports.ER_DUP_UNKNOWN_IN_INDEX = 1859;
  exports.ER_IDENT_CAUSES_TOO_LONG_PATH = 1860;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOT_NULL = 1861;
  exports.ER_MUST_CHANGE_PASSWORD_LOGIN = 1862;
  exports.ER_ROW_IN_WRONG_PARTITION = 1863;
  exports.ER_MTA_EVENT_BIGGER_PENDING_JOBS_SIZE_MAX = 1864;
  exports.ER_INNODB_NO_FT_USES_PARSER = 1865;
  exports.ER_BINLOG_LOGICAL_CORRUPTION = 1866;
  exports.ER_WARN_PURGE_LOG_IN_USE = 1867;
  exports.ER_WARN_PURGE_LOG_IS_ACTIVE = 1868;
  exports.ER_AUTO_INCREMENT_CONFLICT = 1869;
  exports.WARN_ON_BLOCKHOLE_IN_RBR = 1870;
  exports.ER_REPLICA_CM_INIT_REPOSITORY = 1871;
  exports.ER_REPLICA_AM_INIT_REPOSITORY = 1872;
  exports.ER_ACCESS_DENIED_CHANGE_USER_ERROR = 1873;
  exports.ER_INNODB_READ_ONLY = 1874;
  exports.ER_STOP_REPLICA_SQL_THREAD_TIMEOUT = 1875;
  exports.ER_STOP_REPLICA_IO_THREAD_TIMEOUT = 1876;
  exports.ER_TABLE_CORRUPT = 1877;
  exports.ER_TEMP_FILE_WRITE_FAILURE = 1878;
  exports.ER_INNODB_FT_AUX_NOT_HEX_ID = 1879;
  exports.ER_OLD_TEMPORALS_UPGRADED = 1880;
  exports.ER_INNODB_FORCED_RECOVERY = 1881;
  exports.ER_AES_INVALID_IV = 1882;
  exports.ER_PLUGIN_CANNOT_BE_UNINSTALLED = 1883;
  exports.ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_ASSIGNED_GTID = 1884;
  exports.ER_REPLICA_HAS_MORE_GTIDS_THAN_SOURCE = 1885;
  exports.ER_MISSING_KEY = 1886;
  exports.WARN_NAMED_PIPE_ACCESS_EVERYONE = 1887;
  exports.ER_FILE_CORRUPT = 3e3;
  exports.ER_ERROR_ON_SOURCE = 3001;
  exports.ER_INCONSISTENT_ERROR = 3002;
  exports.ER_STORAGE_ENGINE_NOT_LOADED = 3003;
  exports.ER_GET_STACKED_DA_WITHOUT_ACTIVE_HANDLER = 3004;
  exports.ER_WARN_LEGACY_SYNTAX_CONVERTED = 3005;
  exports.ER_BINLOG_UNSAFE_FULLTEXT_PLUGIN = 3006;
  exports.ER_CANNOT_DISCARD_TEMPORARY_TABLE = 3007;
  exports.ER_FK_DEPTH_EXCEEDED = 3008;
  exports.ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE_V2 = 3009;
  exports.ER_WARN_TRIGGER_DOESNT_HAVE_CREATED = 3010;
  exports.ER_REFERENCED_TRG_DOES_NOT_EXIST = 3011;
  exports.ER_EXPLAIN_NOT_SUPPORTED = 3012;
  exports.ER_INVALID_FIELD_SIZE = 3013;
  exports.ER_MISSING_HA_CREATE_OPTION = 3014;
  exports.ER_ENGINE_OUT_OF_MEMORY = 3015;
  exports.ER_PASSWORD_EXPIRE_ANONYMOUS_USER = 3016;
  exports.ER_REPLICA_SQL_THREAD_MUST_STOP = 3017;
  exports.ER_NO_FT_MATERIALIZED_SUBQUERY = 3018;
  exports.ER_INNODB_UNDO_LOG_FULL = 3019;
  exports.ER_INVALID_ARGUMENT_FOR_LOGARITHM = 3020;
  exports.ER_REPLICA_CHANNEL_IO_THREAD_MUST_STOP = 3021;
  exports.ER_WARN_OPEN_TEMP_TABLES_MUST_BE_ZERO = 3022;
  exports.ER_WARN_ONLY_SOURCE_LOG_FILE_NO_POS = 3023;
  exports.ER_QUERY_TIMEOUT = 3024;
  exports.ER_NON_RO_SELECT_DISABLE_TIMER = 3025;
  exports.ER_DUP_LIST_ENTRY = 3026;
  exports.ER_SQL_MODE_NO_EFFECT = 3027;
  exports.ER_AGGREGATE_ORDER_FOR_UNION = 3028;
  exports.ER_AGGREGATE_ORDER_NON_AGG_QUERY = 3029;
  exports.ER_REPLICA_WORKER_STOPPED_PREVIOUS_THD_ERROR = 3030;
  exports.ER_DONT_SUPPORT_REPLICA_PRESERVE_COMMIT_ORDER = 3031;
  exports.ER_SERVER_OFFLINE_MODE = 3032;
  exports.ER_GIS_DIFFERENT_SRIDS = 3033;
  exports.ER_GIS_UNSUPPORTED_ARGUMENT = 3034;
  exports.ER_GIS_UNKNOWN_ERROR = 3035;
  exports.ER_GIS_UNKNOWN_EXCEPTION = 3036;
  exports.ER_GIS_INVALID_DATA = 3037;
  exports.ER_BOOST_GEOMETRY_EMPTY_INPUT_EXCEPTION = 3038;
  exports.ER_BOOST_GEOMETRY_CENTROID_EXCEPTION = 3039;
  exports.ER_BOOST_GEOMETRY_OVERLAY_INVALID_INPUT_EXCEPTION = 3040;
  exports.ER_BOOST_GEOMETRY_TURN_INFO_EXCEPTION = 3041;
  exports.ER_BOOST_GEOMETRY_SELF_INTERSECTION_POINT_EXCEPTION = 3042;
  exports.ER_BOOST_GEOMETRY_UNKNOWN_EXCEPTION = 3043;
  exports.ER_STD_BAD_ALLOC_ERROR = 3044;
  exports.ER_STD_DOMAIN_ERROR = 3045;
  exports.ER_STD_LENGTH_ERROR = 3046;
  exports.ER_STD_INVALID_ARGUMENT = 3047;
  exports.ER_STD_OUT_OF_RANGE_ERROR = 3048;
  exports.ER_STD_OVERFLOW_ERROR = 3049;
  exports.ER_STD_RANGE_ERROR = 3050;
  exports.ER_STD_UNDERFLOW_ERROR = 3051;
  exports.ER_STD_LOGIC_ERROR = 3052;
  exports.ER_STD_RUNTIME_ERROR = 3053;
  exports.ER_STD_UNKNOWN_EXCEPTION = 3054;
  exports.ER_GIS_DATA_WRONG_ENDIANESS = 3055;
  exports.ER_CHANGE_SOURCE_PASSWORD_LENGTH = 3056;
  exports.ER_USER_LOCK_WRONG_NAME = 3057;
  exports.ER_USER_LOCK_DEADLOCK = 3058;
  exports.ER_REPLACE_INACCESSIBLE_ROWS = 3059;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_GIS = 3060;
  exports.ER_ILLEGAL_USER_VAR = 3061;
  exports.ER_GTID_MODE_OFF = 3062;
  exports.ER_UNSUPPORTED_BY_REPLICATION_THREAD = 3063;
  exports.ER_INCORRECT_TYPE = 3064;
  exports.ER_FIELD_IN_ORDER_NOT_SELECT = 3065;
  exports.ER_AGGREGATE_IN_ORDER_NOT_SELECT = 3066;
  exports.ER_INVALID_RPL_WILD_TABLE_FILTER_PATTERN = 3067;
  exports.ER_NET_OK_PACKET_TOO_LARGE = 3068;
  exports.ER_INVALID_JSON_DATA = 3069;
  exports.ER_INVALID_GEOJSON_MISSING_MEMBER = 3070;
  exports.ER_INVALID_GEOJSON_WRONG_TYPE = 3071;
  exports.ER_INVALID_GEOJSON_UNSPECIFIED = 3072;
  exports.ER_DIMENSION_UNSUPPORTED = 3073;
  exports.ER_REPLICA_CHANNEL_DOES_NOT_EXIST = 3074;
  exports.ER_SLAVE_MULTIPLE_CHANNELS_HOST_PORT = 3075;
  exports.ER_REPLICA_CHANNEL_NAME_INVALID_OR_TOO_LONG = 3076;
  exports.ER_REPLICA_NEW_CHANNEL_WRONG_REPOSITORY = 3077;
  exports.ER_SLAVE_CHANNEL_DELETE = 3078;
  exports.ER_REPLICA_MULTIPLE_CHANNELS_CMD = 3079;
  exports.ER_REPLICA_MAX_CHANNELS_EXCEEDED = 3080;
  exports.ER_REPLICA_CHANNEL_MUST_STOP = 3081;
  exports.ER_REPLICA_CHANNEL_NOT_RUNNING = 3082;
  exports.ER_REPLICA_CHANNEL_WAS_RUNNING = 3083;
  exports.ER_REPLICA_CHANNEL_WAS_NOT_RUNNING = 3084;
  exports.ER_REPLICA_CHANNEL_SQL_THREAD_MUST_STOP = 3085;
  exports.ER_REPLICA_CHANNEL_SQL_SKIP_COUNTER = 3086;
  exports.ER_WRONG_FIELD_WITH_GROUP_V2 = 3087;
  exports.ER_MIX_OF_GROUP_FUNC_AND_FIELDS_V2 = 3088;
  exports.ER_WARN_DEPRECATED_SYSVAR_UPDATE = 3089;
  exports.ER_WARN_DEPRECATED_SQLMODE = 3090;
  exports.ER_CANNOT_LOG_PARTIAL_DROP_DATABASE_WITH_GTID = 3091;
  exports.ER_GROUP_REPLICATION_CONFIGURATION = 3092;
  exports.ER_GROUP_REPLICATION_RUNNING = 3093;
  exports.ER_GROUP_REPLICATION_APPLIER_INIT_ERROR = 3094;
  exports.ER_GROUP_REPLICATION_STOP_APPLIER_THREAD_TIMEOUT = 3095;
  exports.ER_GROUP_REPLICATION_COMMUNICATION_LAYER_SESSION_ERROR = 3096;
  exports.ER_GROUP_REPLICATION_COMMUNICATION_LAYER_JOIN_ERROR = 3097;
  exports.ER_BEFORE_DML_VALIDATION_ERROR = 3098;
  exports.ER_PREVENTS_VARIABLE_WITHOUT_RBR = 3099;
  exports.ER_RUN_HOOK_ERROR = 3100;
  exports.ER_TRANSACTION_ROLLBACK_DURING_COMMIT = 3101;
  exports.ER_GENERATED_COLUMN_FUNCTION_IS_NOT_ALLOWED = 3102;
  exports.ER_UNSUPPORTED_ALTER_INPLACE_ON_VIRTUAL_COLUMN = 3103;
  exports.ER_WRONG_FK_OPTION_FOR_GENERATED_COLUMN = 3104;
  exports.ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN = 3105;
  exports.ER_UNSUPPORTED_ACTION_ON_GENERATED_COLUMN = 3106;
  exports.ER_GENERATED_COLUMN_NON_PRIOR = 3107;
  exports.ER_DEPENDENT_BY_GENERATED_COLUMN = 3108;
  exports.ER_GENERATED_COLUMN_REF_AUTO_INC = 3109;
  exports.ER_FEATURE_NOT_AVAILABLE = 3110;
  exports.ER_CANT_SET_GTID_MODE = 3111;
  exports.ER_CANT_USE_AUTO_POSITION_WITH_GTID_MODE_OFF = 3112;
  exports.ER_CANT_REPLICATE_ANONYMOUS_WITH_AUTO_POSITION = 3113;
  exports.ER_CANT_REPLICATE_ANONYMOUS_WITH_GTID_MODE_ON = 3114;
  exports.ER_CANT_REPLICATE_GTID_WITH_GTID_MODE_OFF = 3115;
  exports.ER_CANT_ENFORCE_GTID_CONSISTENCY_WITH_ONGOING_GTID_VIOLATING_TX = 3116;
  exports.ER_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TX = 3117;
  exports.ER_ACCOUNT_HAS_BEEN_LOCKED = 3118;
  exports.ER_WRONG_TABLESPACE_NAME = 3119;
  exports.ER_TABLESPACE_IS_NOT_EMPTY = 3120;
  exports.ER_WRONG_FILE_NAME = 3121;
  exports.ER_BOOST_GEOMETRY_INCONSISTENT_TURNS_EXCEPTION = 3122;
  exports.ER_WARN_OPTIMIZER_HINT_SYNTAX_ERROR = 3123;
  exports.ER_WARN_BAD_MAX_EXECUTION_TIME = 3124;
  exports.ER_WARN_UNSUPPORTED_MAX_EXECUTION_TIME = 3125;
  exports.ER_WARN_CONFLICTING_HINT = 3126;
  exports.ER_WARN_UNKNOWN_QB_NAME = 3127;
  exports.ER_UNRESOLVED_HINT_NAME = 3128;
  exports.ER_WARN_ON_MODIFYING_GTID_EXECUTED_TABLE = 3129;
  exports.ER_PLUGGABLE_PROTOCOL_COMMAND_NOT_SUPPORTED = 3130;
  exports.ER_LOCKING_SERVICE_WRONG_NAME = 3131;
  exports.ER_LOCKING_SERVICE_DEADLOCK = 3132;
  exports.ER_LOCKING_SERVICE_TIMEOUT = 3133;
  exports.ER_GIS_MAX_POINTS_IN_GEOMETRY_OVERFLOWED = 3134;
  exports.ER_SQL_MODE_MERGED = 3135;
  exports.ER_VTOKEN_PLUGIN_TOKEN_MISMATCH = 3136;
  exports.ER_VTOKEN_PLUGIN_TOKEN_NOT_FOUND = 3137;
  exports.ER_CANT_SET_VARIABLE_WHEN_OWNING_GTID = 3138;
  exports.ER_REPLICA_CHANNEL_OPERATION_NOT_ALLOWED = 3139;
  exports.ER_INVALID_JSON_TEXT = 3140;
  exports.ER_INVALID_JSON_TEXT_IN_PARAM = 3141;
  exports.ER_INVALID_JSON_BINARY_DATA = 3142;
  exports.ER_INVALID_JSON_PATH = 3143;
  exports.ER_INVALID_JSON_CHARSET = 3144;
  exports.ER_INVALID_JSON_CHARSET_IN_FUNCTION = 3145;
  exports.ER_INVALID_TYPE_FOR_JSON = 3146;
  exports.ER_INVALID_CAST_TO_JSON = 3147;
  exports.ER_INVALID_JSON_PATH_CHARSET = 3148;
  exports.ER_INVALID_JSON_PATH_WILDCARD = 3149;
  exports.ER_JSON_VALUE_TOO_BIG = 3150;
  exports.ER_JSON_KEY_TOO_BIG = 3151;
  exports.ER_JSON_USED_AS_KEY = 3152;
  exports.ER_JSON_VACUOUS_PATH = 3153;
  exports.ER_JSON_BAD_ONE_OR_ALL_ARG = 3154;
  exports.ER_NUMERIC_JSON_VALUE_OUT_OF_RANGE = 3155;
  exports.ER_INVALID_JSON_VALUE_FOR_CAST = 3156;
  exports.ER_JSON_DOCUMENT_TOO_DEEP = 3157;
  exports.ER_JSON_DOCUMENT_NULL_KEY = 3158;
  exports.ER_SECURE_TRANSPORT_REQUIRED = 3159;
  exports.ER_NO_SECURE_TRANSPORTS_CONFIGURED = 3160;
  exports.ER_DISABLED_STORAGE_ENGINE = 3161;
  exports.ER_USER_DOES_NOT_EXIST = 3162;
  exports.ER_USER_ALREADY_EXISTS = 3163;
  exports.ER_AUDIT_API_ABORT = 3164;
  exports.ER_INVALID_JSON_PATH_ARRAY_CELL = 3165;
  exports.ER_BUFPOOL_RESIZE_INPROGRESS = 3166;
  exports.ER_FEATURE_DISABLED_SEE_DOC = 3167;
  exports.ER_SERVER_ISNT_AVAILABLE = 3168;
  exports.ER_SESSION_WAS_KILLED = 3169;
  exports.ER_CAPACITY_EXCEEDED = 3170;
  exports.ER_CAPACITY_EXCEEDED_IN_RANGE_OPTIMIZER = 3171;
  exports.ER_TABLE_NEEDS_UPG_PART = 3172;
  exports.ER_CANT_WAIT_FOR_EXECUTED_GTID_SET_WHILE_OWNING_A_GTID = 3173;
  exports.ER_CANNOT_ADD_FOREIGN_BASE_COL_VIRTUAL = 3174;
  exports.ER_CANNOT_CREATE_VIRTUAL_INDEX_CONSTRAINT = 3175;
  exports.ER_ERROR_ON_MODIFYING_GTID_EXECUTED_TABLE = 3176;
  exports.ER_LOCK_REFUSED_BY_ENGINE = 3177;
  exports.ER_UNSUPPORTED_ALTER_ONLINE_ON_VIRTUAL_COLUMN = 3178;
  exports.ER_MASTER_KEY_ROTATION_NOT_SUPPORTED_BY_SE = 3179;
  exports.ER_MASTER_KEY_ROTATION_ERROR_BY_SE = 3180;
  exports.ER_MASTER_KEY_ROTATION_BINLOG_FAILED = 3181;
  exports.ER_MASTER_KEY_ROTATION_SE_UNAVAILABLE = 3182;
  exports.ER_TABLESPACE_CANNOT_ENCRYPT = 3183;
  exports.ER_INVALID_ENCRYPTION_OPTION = 3184;
  exports.ER_CANNOT_FIND_KEY_IN_KEYRING = 3185;
  exports.ER_CAPACITY_EXCEEDED_IN_PARSER = 3186;
  exports.ER_UNSUPPORTED_ALTER_ENCRYPTION_INPLACE = 3187;
  exports.ER_KEYRING_UDF_KEYRING_SERVICE_ERROR = 3188;
  exports.ER_USER_COLUMN_OLD_LENGTH = 3189;
  exports.ER_CANT_RESET_SOURCE = 3190;
  exports.ER_GROUP_REPLICATION_MAX_GROUP_SIZE = 3191;
  exports.ER_CANNOT_ADD_FOREIGN_BASE_COL_STORED = 3192;
  exports.ER_TABLE_REFERENCED = 3193;
  exports.ER_PARTITION_ENGINE_DEPRECATED_FOR_TABLE = 3194;
  exports.ER_WARN_USING_GEOMFROMWKB_TO_SET_SRID_ZERO = 3195;
  exports.ER_WARN_USING_GEOMFROMWKB_TO_SET_SRID = 3196;
  exports.ER_XA_RETRY = 3197;
  exports.ER_KEYRING_AWS_UDF_AWS_KMS_ERROR = 3198;
  exports.ER_BINLOG_UNSAFE_XA = 3199;
  exports.ER_UDF_ERROR = 3200;
  exports.ER_KEYRING_MIGRATION_FAILURE = 3201;
  exports.ER_KEYRING_ACCESS_DENIED_ERROR = 3202;
  exports.ER_KEYRING_MIGRATION_STATUS = 3203;
  exports.ER_PLUGIN_FAILED_TO_OPEN_TABLES = 3204;
  exports.ER_PLUGIN_FAILED_TO_OPEN_TABLE = 3205;
  exports.ER_AUDIT_LOG_NO_KEYRING_PLUGIN_INSTALLED = 3206;
  exports.ER_AUDIT_LOG_ENCRYPTION_PASSWORD_HAS_NOT_BEEN_SET = 3207;
  exports.ER_AUDIT_LOG_COULD_NOT_CREATE_AES_KEY = 3208;
  exports.ER_AUDIT_LOG_ENCRYPTION_PASSWORD_CANNOT_BE_FETCHED = 3209;
  exports.ER_AUDIT_LOG_JSON_FILTERING_NOT_ENABLED = 3210;
  exports.ER_AUDIT_LOG_UDF_INSUFFICIENT_PRIVILEGE = 3211;
  exports.ER_AUDIT_LOG_SUPER_PRIVILEGE_REQUIRED = 3212;
  exports.ER_COULD_NOT_REINITIALIZE_AUDIT_LOG_FILTERS = 3213;
  exports.ER_AUDIT_LOG_UDF_INVALID_ARGUMENT_TYPE = 3214;
  exports.ER_AUDIT_LOG_UDF_INVALID_ARGUMENT_COUNT = 3215;
  exports.ER_AUDIT_LOG_HAS_NOT_BEEN_INSTALLED = 3216;
  exports.ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_TYPE = 3217;
  exports.ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_VALUE = 3218;
  exports.ER_AUDIT_LOG_JSON_FILTER_PARSING_ERROR = 3219;
  exports.ER_AUDIT_LOG_JSON_FILTER_NAME_CANNOT_BE_EMPTY = 3220;
  exports.ER_AUDIT_LOG_JSON_USER_NAME_CANNOT_BE_EMPTY = 3221;
  exports.ER_AUDIT_LOG_JSON_FILTER_DOES_NOT_EXISTS = 3222;
  exports.ER_AUDIT_LOG_USER_FIRST_CHARACTER_MUST_BE_ALPHANUMERIC = 3223;
  exports.ER_AUDIT_LOG_USER_NAME_INVALID_CHARACTER = 3224;
  exports.ER_AUDIT_LOG_HOST_NAME_INVALID_CHARACTER = 3225;
  exports.WARN_DEPRECATED_MAXDB_SQL_MODE_FOR_TIMESTAMP = 3226;
  exports.ER_XA_REPLICATION_FILTERS = 3227;
  exports.ER_CANT_OPEN_ERROR_LOG = 3228;
  exports.ER_GROUPING_ON_TIMESTAMP_IN_DST = 3229;
  exports.ER_CANT_START_SERVER_NAMED_PIPE = 3230;
  exports.ER_WRITE_SET_EXCEEDS_LIMIT = 3231;
  exports.ER_DEPRECATED_TLS_VERSION_SESSION_57 = 3232;
  exports.ER_WARN_DEPRECATED_TLS_VERSION_57 = 3233;
  exports.ER_WARN_WRONG_NATIVE_TABLE_STRUCTURE = 3234;
  exports.ER_AES_INVALID_KDF_NAME = 3235;
  exports.ER_AES_INVALID_KDF_ITERATIONS = 3236;
  exports.WARN_AES_KEY_SIZE = 3237;
  exports.ER_AES_INVALID_KDF_OPTION_SIZE = 3238;
  exports.ER_UNSUPPORT_COMPRESSED_TEMPORARY_TABLE = 3500;
  exports.ER_ACL_OPERATION_FAILED = 3501;
  exports.ER_UNSUPPORTED_INDEX_ALGORITHM = 3502;
  exports.ER_NO_SUCH_DB = 3503;
  exports.ER_TOO_BIG_ENUM = 3504;
  exports.ER_TOO_LONG_SET_ENUM_VALUE = 3505;
  exports.ER_INVALID_DD_OBJECT = 3506;
  exports.ER_UPDATING_DD_TABLE = 3507;
  exports.ER_INVALID_DD_OBJECT_ID = 3508;
  exports.ER_INVALID_DD_OBJECT_NAME = 3509;
  exports.ER_TABLESPACE_MISSING_WITH_NAME = 3510;
  exports.ER_TOO_LONG_ROUTINE_COMMENT = 3511;
  exports.ER_SP_LOAD_FAILED = 3512;
  exports.ER_INVALID_BITWISE_OPERANDS_SIZE = 3513;
  exports.ER_INVALID_BITWISE_AGGREGATE_OPERANDS_SIZE = 3514;
  exports.ER_WARN_UNSUPPORTED_HINT = 3515;
  exports.ER_UNEXPECTED_GEOMETRY_TYPE = 3516;
  exports.ER_SRS_PARSE_ERROR = 3517;
  exports.ER_SRS_PROJ_PARAMETER_MISSING = 3518;
  exports.ER_WARN_SRS_NOT_FOUND = 3519;
  exports.ER_SRS_NOT_CARTESIAN = 3520;
  exports.ER_SRS_NOT_CARTESIAN_UNDEFINED = 3521;
  exports.ER_PK_INDEX_CANT_BE_INVISIBLE = 3522;
  exports.ER_UNKNOWN_AUTHID = 3523;
  exports.ER_FAILED_ROLE_GRANT = 3524;
  exports.ER_OPEN_ROLE_TABLES = 3525;
  exports.ER_FAILED_DEFAULT_ROLES = 3526;
  exports.ER_COMPONENTS_NO_SCHEME = 3527;
  exports.ER_COMPONENTS_NO_SCHEME_SERVICE = 3528;
  exports.ER_COMPONENTS_CANT_LOAD = 3529;
  exports.ER_ROLE_NOT_GRANTED = 3530;
  exports.ER_FAILED_REVOKE_ROLE = 3531;
  exports.ER_RENAME_ROLE = 3532;
  exports.ER_COMPONENTS_CANT_ACQUIRE_SERVICE_IMPLEMENTATION = 3533;
  exports.ER_COMPONENTS_CANT_SATISFY_DEPENDENCY = 3534;
  exports.ER_COMPONENTS_LOAD_CANT_REGISTER_SERVICE_IMPLEMENTATION = 3535;
  exports.ER_COMPONENTS_LOAD_CANT_INITIALIZE = 3536;
  exports.ER_COMPONENTS_UNLOAD_NOT_LOADED = 3537;
  exports.ER_COMPONENTS_UNLOAD_CANT_DEINITIALIZE = 3538;
  exports.ER_COMPONENTS_CANT_RELEASE_SERVICE = 3539;
  exports.ER_COMPONENTS_UNLOAD_CANT_UNREGISTER_SERVICE = 3540;
  exports.ER_COMPONENTS_CANT_UNLOAD = 3541;
  exports.ER_WARN_UNLOAD_THE_NOT_PERSISTED = 3542;
  exports.ER_COMPONENT_TABLE_INCORRECT = 3543;
  exports.ER_COMPONENT_MANIPULATE_ROW_FAILED = 3544;
  exports.ER_COMPONENTS_UNLOAD_DUPLICATE_IN_GROUP = 3545;
  exports.ER_CANT_SET_GTID_PURGED_DUE_SETS_CONSTRAINTS = 3546;
  exports.ER_CANNOT_LOCK_USER_MANAGEMENT_CACHES = 3547;
  exports.ER_SRS_NOT_FOUND = 3548;
  exports.ER_VARIABLE_NOT_PERSISTED = 3549;
  exports.ER_IS_QUERY_INVALID_CLAUSE = 3550;
  exports.ER_UNABLE_TO_STORE_STATISTICS = 3551;
  exports.ER_NO_SYSTEM_SCHEMA_ACCESS = 3552;
  exports.ER_NO_SYSTEM_TABLESPACE_ACCESS = 3553;
  exports.ER_NO_SYSTEM_TABLE_ACCESS = 3554;
  exports.ER_NO_SYSTEM_TABLE_ACCESS_FOR_DICTIONARY_TABLE = 3555;
  exports.ER_NO_SYSTEM_TABLE_ACCESS_FOR_SYSTEM_TABLE = 3556;
  exports.ER_NO_SYSTEM_TABLE_ACCESS_FOR_TABLE = 3557;
  exports.ER_INVALID_OPTION_KEY = 3558;
  exports.ER_INVALID_OPTION_VALUE = 3559;
  exports.ER_INVALID_OPTION_KEY_VALUE_PAIR = 3560;
  exports.ER_INVALID_OPTION_START_CHARACTER = 3561;
  exports.ER_INVALID_OPTION_END_CHARACTER = 3562;
  exports.ER_INVALID_OPTION_CHARACTERS = 3563;
  exports.ER_DUPLICATE_OPTION_KEY = 3564;
  exports.ER_WARN_SRS_NOT_FOUND_AXIS_ORDER = 3565;
  exports.ER_NO_ACCESS_TO_NATIVE_FCT = 3566;
  exports.ER_RESET_SOURCE_TO_VALUE_OUT_OF_RANGE = 3567;
  exports.ER_UNRESOLVED_TABLE_LOCK = 3568;
  exports.ER_DUPLICATE_TABLE_LOCK = 3569;
  exports.ER_BINLOG_UNSAFE_SKIP_LOCKED = 3570;
  exports.ER_BINLOG_UNSAFE_NOWAIT = 3571;
  exports.ER_LOCK_NOWAIT = 3572;
  exports.ER_CTE_RECURSIVE_REQUIRES_UNION = 3573;
  exports.ER_CTE_RECURSIVE_REQUIRES_NONRECURSIVE_FIRST = 3574;
  exports.ER_CTE_RECURSIVE_FORBIDS_AGGREGATION = 3575;
  exports.ER_CTE_RECURSIVE_FORBIDDEN_JOIN_ORDER = 3576;
  exports.ER_CTE_RECURSIVE_REQUIRES_SINGLE_REFERENCE = 3577;
  exports.ER_SWITCH_TMP_ENGINE = 3578;
  exports.ER_WINDOW_NO_SUCH_WINDOW = 3579;
  exports.ER_WINDOW_CIRCULARITY_IN_WINDOW_GRAPH = 3580;
  exports.ER_WINDOW_NO_CHILD_PARTITIONING = 3581;
  exports.ER_WINDOW_NO_INHERIT_FRAME = 3582;
  exports.ER_WINDOW_NO_REDEFINE_ORDER_BY = 3583;
  exports.ER_WINDOW_FRAME_START_ILLEGAL = 3584;
  exports.ER_WINDOW_FRAME_END_ILLEGAL = 3585;
  exports.ER_WINDOW_FRAME_ILLEGAL = 3586;
  exports.ER_WINDOW_RANGE_FRAME_ORDER_TYPE = 3587;
  exports.ER_WINDOW_RANGE_FRAME_TEMPORAL_TYPE = 3588;
  exports.ER_WINDOW_RANGE_FRAME_NUMERIC_TYPE = 3589;
  exports.ER_WINDOW_RANGE_BOUND_NOT_CONSTANT = 3590;
  exports.ER_WINDOW_DUPLICATE_NAME = 3591;
  exports.ER_WINDOW_ILLEGAL_ORDER_BY = 3592;
  exports.ER_WINDOW_INVALID_WINDOW_FUNC_USE = 3593;
  exports.ER_WINDOW_INVALID_WINDOW_FUNC_ALIAS_USE = 3594;
  exports.ER_WINDOW_NESTED_WINDOW_FUNC_USE_IN_WINDOW_SPEC = 3595;
  exports.ER_WINDOW_ROWS_INTERVAL_USE = 3596;
  exports.ER_WINDOW_NO_GROUP_ORDER = 3597;
  exports.ER_WINDOW_EXPLAIN_JSON = 3598;
  exports.ER_WINDOW_FUNCTION_IGNORES_FRAME = 3599;
  exports.ER_WL9236_NOW = 3600;
  exports.ER_INVALID_NO_OF_ARGS = 3601;
  exports.ER_FIELD_IN_GROUPING_NOT_GROUP_BY = 3602;
  exports.ER_TOO_LONG_TABLESPACE_COMMENT = 3603;
  exports.ER_ENGINE_CANT_DROP_TABLE = 3604;
  exports.ER_ENGINE_CANT_DROP_MISSING_TABLE = 3605;
  exports.ER_TABLESPACE_DUP_FILENAME = 3606;
  exports.ER_DB_DROP_RMDIR2 = 3607;
  exports.ER_IMP_NO_FILES_MATCHED = 3608;
  exports.ER_IMP_SCHEMA_DOES_NOT_EXIST = 3609;
  exports.ER_IMP_TABLE_ALREADY_EXISTS = 3610;
  exports.ER_IMP_INCOMPATIBLE_MYSQLD_VERSION = 3611;
  exports.ER_IMP_INCOMPATIBLE_DD_VERSION = 3612;
  exports.ER_IMP_INCOMPATIBLE_SDI_VERSION = 3613;
  exports.ER_WARN_INVALID_HINT = 3614;
  exports.ER_VAR_DOES_NOT_EXIST = 3615;
  exports.ER_LONGITUDE_OUT_OF_RANGE = 3616;
  exports.ER_LATITUDE_OUT_OF_RANGE = 3617;
  exports.ER_NOT_IMPLEMENTED_FOR_GEOGRAPHIC_SRS = 3618;
  exports.ER_ILLEGAL_PRIVILEGE_LEVEL = 3619;
  exports.ER_NO_SYSTEM_VIEW_ACCESS = 3620;
  exports.ER_COMPONENT_FILTER_FLABBERGASTED = 3621;
  exports.ER_PART_EXPR_TOO_LONG = 3622;
  exports.ER_UDF_DROP_DYNAMICALLY_REGISTERED = 3623;
  exports.ER_UNABLE_TO_STORE_COLUMN_STATISTICS = 3624;
  exports.ER_UNABLE_TO_UPDATE_COLUMN_STATISTICS = 3625;
  exports.ER_UNABLE_TO_DROP_COLUMN_STATISTICS = 3626;
  exports.ER_UNABLE_TO_BUILD_HISTOGRAM = 3627;
  exports.ER_MANDATORY_ROLE = 3628;
  exports.ER_MISSING_TABLESPACE_FILE = 3629;
  exports.ER_PERSIST_ONLY_ACCESS_DENIED_ERROR = 3630;
  exports.ER_CMD_NEED_SUPER = 3631;
  exports.ER_PATH_IN_DATADIR = 3632;
  exports.ER_CLONE_DDL_IN_PROGRESS = 3633;
  exports.ER_CLONE_TOO_MANY_CONCURRENT_CLONES = 3634;
  exports.ER_APPLIER_LOG_EVENT_VALIDATION_ERROR = 3635;
  exports.ER_CTE_MAX_RECURSION_DEPTH = 3636;
  exports.ER_NOT_HINT_UPDATABLE_VARIABLE = 3637;
  exports.ER_CREDENTIALS_CONTRADICT_TO_HISTORY = 3638;
  exports.ER_WARNING_PASSWORD_HISTORY_CLAUSES_VOID = 3639;
  exports.ER_CLIENT_DOES_NOT_SUPPORT = 3640;
  exports.ER_I_S_SKIPPED_TABLESPACE = 3641;
  exports.ER_TABLESPACE_ENGINE_MISMATCH = 3642;
  exports.ER_WRONG_SRID_FOR_COLUMN = 3643;
  exports.ER_CANNOT_ALTER_SRID_DUE_TO_INDEX = 3644;
  exports.ER_WARN_BINLOG_PARTIAL_UPDATES_DISABLED = 3645;
  exports.ER_WARN_BINLOG_V1_ROW_EVENTS_DISABLED = 3646;
  exports.ER_WARN_BINLOG_PARTIAL_UPDATES_SUGGESTS_PARTIAL_IMAGES = 3647;
  exports.ER_COULD_NOT_APPLY_JSON_DIFF = 3648;
  exports.ER_CORRUPTED_JSON_DIFF = 3649;
  exports.ER_RESOURCE_GROUP_EXISTS = 3650;
  exports.ER_RESOURCE_GROUP_NOT_EXISTS = 3651;
  exports.ER_INVALID_VCPU_ID = 3652;
  exports.ER_INVALID_VCPU_RANGE = 3653;
  exports.ER_INVALID_THREAD_PRIORITY = 3654;
  exports.ER_DISALLOWED_OPERATION = 3655;
  exports.ER_RESOURCE_GROUP_BUSY = 3656;
  exports.ER_RESOURCE_GROUP_DISABLED = 3657;
  exports.ER_FEATURE_UNSUPPORTED = 3658;
  exports.ER_ATTRIBUTE_IGNORED = 3659;
  exports.ER_INVALID_THREAD_ID = 3660;
  exports.ER_RESOURCE_GROUP_BIND_FAILED = 3661;
  exports.ER_INVALID_USE_OF_FORCE_OPTION = 3662;
  exports.ER_GROUP_REPLICATION_COMMAND_FAILURE = 3663;
  exports.ER_SDI_OPERATION_FAILED = 3664;
  exports.ER_MISSING_JSON_TABLE_VALUE = 3665;
  exports.ER_WRONG_JSON_TABLE_VALUE = 3666;
  exports.ER_TF_MUST_HAVE_ALIAS = 3667;
  exports.ER_TF_FORBIDDEN_JOIN_TYPE = 3668;
  exports.ER_JT_VALUE_OUT_OF_RANGE = 3669;
  exports.ER_JT_MAX_NESTED_PATH = 3670;
  exports.ER_PASSWORD_EXPIRATION_NOT_SUPPORTED_BY_AUTH_METHOD = 3671;
  exports.ER_INVALID_GEOJSON_CRS_NOT_TOP_LEVEL = 3672;
  exports.ER_BAD_NULL_ERROR_NOT_IGNORED = 3673;
  exports.WARN_USELESS_SPATIAL_INDEX = 3674;
  exports.ER_DISK_FULL_NOWAIT = 3675;
  exports.ER_PARSE_ERROR_IN_DIGEST_FN = 3676;
  exports.ER_UNDISCLOSED_PARSE_ERROR_IN_DIGEST_FN = 3677;
  exports.ER_SCHEMA_DIR_EXISTS = 3678;
  exports.ER_SCHEMA_DIR_MISSING = 3679;
  exports.ER_SCHEMA_DIR_CREATE_FAILED = 3680;
  exports.ER_SCHEMA_DIR_UNKNOWN = 3681;
  exports.ER_ONLY_IMPLEMENTED_FOR_SRID_0_AND_4326 = 3682;
  exports.ER_BINLOG_EXPIRE_LOG_DAYS_AND_SECS_USED_TOGETHER = 3683;
  exports.ER_REGEXP_BUFFER_OVERFLOW = 3684;
  exports.ER_REGEXP_ILLEGAL_ARGUMENT = 3685;
  exports.ER_REGEXP_INDEX_OUTOFBOUNDS_ERROR = 3686;
  exports.ER_REGEXP_INTERNAL_ERROR = 3687;
  exports.ER_REGEXP_RULE_SYNTAX = 3688;
  exports.ER_REGEXP_BAD_ESCAPE_SEQUENCE = 3689;
  exports.ER_REGEXP_UNIMPLEMENTED = 3690;
  exports.ER_REGEXP_MISMATCHED_PAREN = 3691;
  exports.ER_REGEXP_BAD_INTERVAL = 3692;
  exports.ER_REGEXP_MAX_LT_MIN = 3693;
  exports.ER_REGEXP_INVALID_BACK_REF = 3694;
  exports.ER_REGEXP_LOOK_BEHIND_LIMIT = 3695;
  exports.ER_REGEXP_MISSING_CLOSE_BRACKET = 3696;
  exports.ER_REGEXP_INVALID_RANGE = 3697;
  exports.ER_REGEXP_STACK_OVERFLOW = 3698;
  exports.ER_REGEXP_TIME_OUT = 3699;
  exports.ER_REGEXP_PATTERN_TOO_BIG = 3700;
  exports.ER_CANT_SET_ERROR_LOG_SERVICE = 3701;
  exports.ER_EMPTY_PIPELINE_FOR_ERROR_LOG_SERVICE = 3702;
  exports.ER_COMPONENT_FILTER_DIAGNOSTICS = 3703;
  exports.ER_NOT_IMPLEMENTED_FOR_CARTESIAN_SRS = 3704;
  exports.ER_NOT_IMPLEMENTED_FOR_PROJECTED_SRS = 3705;
  exports.ER_NONPOSITIVE_RADIUS = 3706;
  exports.ER_RESTART_SERVER_FAILED = 3707;
  exports.ER_SRS_MISSING_MANDATORY_ATTRIBUTE = 3708;
  exports.ER_SRS_MULTIPLE_ATTRIBUTE_DEFINITIONS = 3709;
  exports.ER_SRS_NAME_CANT_BE_EMPTY_OR_WHITESPACE = 3710;
  exports.ER_SRS_ORGANIZATION_CANT_BE_EMPTY_OR_WHITESPACE = 3711;
  exports.ER_SRS_ID_ALREADY_EXISTS = 3712;
  exports.ER_WARN_SRS_ID_ALREADY_EXISTS = 3713;
  exports.ER_CANT_MODIFY_SRID_0 = 3714;
  exports.ER_WARN_RESERVED_SRID_RANGE = 3715;
  exports.ER_CANT_MODIFY_SRS_USED_BY_COLUMN = 3716;
  exports.ER_SRS_INVALID_CHARACTER_IN_ATTRIBUTE = 3717;
  exports.ER_SRS_ATTRIBUTE_STRING_TOO_LONG = 3718;
  exports.ER_DEPRECATED_UTF8_ALIAS = 3719;
  exports.ER_DEPRECATED_NATIONAL = 3720;
  exports.ER_INVALID_DEFAULT_UTF8MB4_COLLATION = 3721;
  exports.ER_UNABLE_TO_COLLECT_LOG_STATUS = 3722;
  exports.ER_RESERVED_TABLESPACE_NAME = 3723;
  exports.ER_UNABLE_TO_SET_OPTION = 3724;
  exports.ER_REPLICA_POSSIBLY_DIVERGED_AFTER_DDL = 3725;
  exports.ER_SRS_NOT_GEOGRAPHIC = 3726;
  exports.ER_POLYGON_TOO_LARGE = 3727;
  exports.ER_SPATIAL_UNIQUE_INDEX = 3728;
  exports.ER_INDEX_TYPE_NOT_SUPPORTED_FOR_SPATIAL_INDEX = 3729;
  exports.ER_FK_CANNOT_DROP_PARENT = 3730;
  exports.ER_GEOMETRY_PARAM_LONGITUDE_OUT_OF_RANGE = 3731;
  exports.ER_GEOMETRY_PARAM_LATITUDE_OUT_OF_RANGE = 3732;
  exports.ER_FK_CANNOT_USE_VIRTUAL_COLUMN = 3733;
  exports.ER_FK_NO_COLUMN_PARENT = 3734;
  exports.ER_CANT_SET_ERROR_SUPPRESSION_LIST = 3735;
  exports.ER_SRS_GEOGCS_INVALID_AXES = 3736;
  exports.ER_SRS_INVALID_SEMI_MAJOR_AXIS = 3737;
  exports.ER_SRS_INVALID_INVERSE_FLATTENING = 3738;
  exports.ER_SRS_INVALID_ANGULAR_UNIT = 3739;
  exports.ER_SRS_INVALID_PRIME_MERIDIAN = 3740;
  exports.ER_TRANSFORM_SOURCE_SRS_NOT_SUPPORTED = 3741;
  exports.ER_TRANSFORM_TARGET_SRS_NOT_SUPPORTED = 3742;
  exports.ER_TRANSFORM_SOURCE_SRS_MISSING_TOWGS84 = 3743;
  exports.ER_TRANSFORM_TARGET_SRS_MISSING_TOWGS84 = 3744;
  exports.ER_TEMP_TABLE_PREVENTS_SWITCH_SESSION_BINLOG_FORMAT = 3745;
  exports.ER_TEMP_TABLE_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT = 3746;
  exports.ER_RUNNING_APPLIER_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT = 3747;
  exports.ER_CLIENT_GTID_UNSAFE_CREATE_DROP_TEMP_TABLE_IN_TRX_IN_SBR = 3748;
  exports.ER_XA_CANT_CREATE_MDL_BACKUP = 3749;
  exports.ER_TABLE_WITHOUT_PK = 3750;
  exports.ER_WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX = 3751;
  exports.ER_WARN_DATA_OUT_OF_RANGE_FUNCTIONAL_INDEX = 3752;
  exports.ER_FUNCTIONAL_INDEX_ON_JSON_OR_GEOMETRY_FUNCTION = 3753;
  exports.ER_FUNCTIONAL_INDEX_REF_AUTO_INCREMENT = 3754;
  exports.ER_CANNOT_DROP_COLUMN_FUNCTIONAL_INDEX = 3755;
  exports.ER_FUNCTIONAL_INDEX_PRIMARY_KEY = 3756;
  exports.ER_FUNCTIONAL_INDEX_ON_LOB = 3757;
  exports.ER_FUNCTIONAL_INDEX_FUNCTION_IS_NOT_ALLOWED = 3758;
  exports.ER_FULLTEXT_FUNCTIONAL_INDEX = 3759;
  exports.ER_SPATIAL_FUNCTIONAL_INDEX = 3760;
  exports.ER_WRONG_KEY_COLUMN_FUNCTIONAL_INDEX = 3761;
  exports.ER_FUNCTIONAL_INDEX_ON_FIELD = 3762;
  exports.ER_GENERATED_COLUMN_NAMED_FUNCTION_IS_NOT_ALLOWED = 3763;
  exports.ER_GENERATED_COLUMN_ROW_VALUE = 3764;
  exports.ER_GENERATED_COLUMN_VARIABLES = 3765;
  exports.ER_DEPENDENT_BY_DEFAULT_GENERATED_VALUE = 3766;
  exports.ER_DEFAULT_VAL_GENERATED_NON_PRIOR = 3767;
  exports.ER_DEFAULT_VAL_GENERATED_REF_AUTO_INC = 3768;
  exports.ER_DEFAULT_VAL_GENERATED_FUNCTION_IS_NOT_ALLOWED = 3769;
  exports.ER_DEFAULT_VAL_GENERATED_NAMED_FUNCTION_IS_NOT_ALLOWED = 3770;
  exports.ER_DEFAULT_VAL_GENERATED_ROW_VALUE = 3771;
  exports.ER_DEFAULT_VAL_GENERATED_VARIABLES = 3772;
  exports.ER_DEFAULT_AS_VAL_GENERATED = 3773;
  exports.ER_UNSUPPORTED_ACTION_ON_DEFAULT_VAL_GENERATED = 3774;
  exports.ER_GTID_UNSAFE_ALTER_ADD_COL_WITH_DEFAULT_EXPRESSION = 3775;
  exports.ER_FK_CANNOT_CHANGE_ENGINE = 3776;
  exports.ER_WARN_DEPRECATED_USER_SET_EXPR = 3777;
  exports.ER_WARN_DEPRECATED_UTF8MB3_COLLATION = 3778;
  exports.ER_WARN_DEPRECATED_NESTED_COMMENT_SYNTAX = 3779;
  exports.ER_FK_INCOMPATIBLE_COLUMNS = 3780;
  exports.ER_GR_HOLD_WAIT_TIMEOUT = 3781;
  exports.ER_GR_HOLD_KILLED = 3782;
  exports.ER_GR_HOLD_MEMBER_STATUS_ERROR = 3783;
  exports.ER_RPL_ENCRYPTION_FAILED_TO_FETCH_KEY = 3784;
  exports.ER_RPL_ENCRYPTION_KEY_NOT_FOUND = 3785;
  exports.ER_RPL_ENCRYPTION_KEYRING_INVALID_KEY = 3786;
  exports.ER_RPL_ENCRYPTION_HEADER_ERROR = 3787;
  exports.ER_RPL_ENCRYPTION_FAILED_TO_ROTATE_LOGS = 3788;
  exports.ER_RPL_ENCRYPTION_KEY_EXISTS_UNEXPECTED = 3789;
  exports.ER_RPL_ENCRYPTION_FAILED_TO_GENERATE_KEY = 3790;
  exports.ER_RPL_ENCRYPTION_FAILED_TO_STORE_KEY = 3791;
  exports.ER_RPL_ENCRYPTION_FAILED_TO_REMOVE_KEY = 3792;
  exports.ER_RPL_ENCRYPTION_UNABLE_TO_CHANGE_OPTION = 3793;
  exports.ER_RPL_ENCRYPTION_MASTER_KEY_RECOVERY_FAILED = 3794;
  exports.ER_SLOW_LOG_MODE_IGNORED_WHEN_NOT_LOGGING_TO_FILE = 3795;
  exports.ER_GRP_TRX_CONSISTENCY_NOT_ALLOWED = 3796;
  exports.ER_GRP_TRX_CONSISTENCY_BEFORE = 3797;
  exports.ER_GRP_TRX_CONSISTENCY_AFTER_ON_TRX_BEGIN = 3798;
  exports.ER_GRP_TRX_CONSISTENCY_BEGIN_NOT_ALLOWED = 3799;
  exports.ER_FUNCTIONAL_INDEX_ROW_VALUE_IS_NOT_ALLOWED = 3800;
  exports.ER_RPL_ENCRYPTION_FAILED_TO_ENCRYPT = 3801;
  exports.ER_PAGE_TRACKING_NOT_STARTED = 3802;
  exports.ER_PAGE_TRACKING_RANGE_NOT_TRACKED = 3803;
  exports.ER_PAGE_TRACKING_CANNOT_PURGE = 3804;
  exports.ER_RPL_ENCRYPTION_CANNOT_ROTATE_BINLOG_MASTER_KEY = 3805;
  exports.ER_BINLOG_MASTER_KEY_RECOVERY_OUT_OF_COMBINATION = 3806;
  exports.ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_OPERATE_KEY = 3807;
  exports.ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_ROTATE_LOGS = 3808;
  exports.ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_REENCRYPT_LOG = 3809;
  exports.ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_UNUSED_KEYS = 3810;
  exports.ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_AUX_KEY = 3811;
  exports.ER_NON_BOOLEAN_EXPR_FOR_CHECK_CONSTRAINT = 3812;
  exports.ER_COLUMN_CHECK_CONSTRAINT_REFERENCES_OTHER_COLUMN = 3813;
  exports.ER_CHECK_CONSTRAINT_NAMED_FUNCTION_IS_NOT_ALLOWED = 3814;
  exports.ER_CHECK_CONSTRAINT_FUNCTION_IS_NOT_ALLOWED = 3815;
  exports.ER_CHECK_CONSTRAINT_VARIABLES = 3816;
  exports.ER_CHECK_CONSTRAINT_ROW_VALUE = 3817;
  exports.ER_CHECK_CONSTRAINT_REFERS_AUTO_INCREMENT_COLUMN = 3818;
  exports.ER_CHECK_CONSTRAINT_VIOLATED = 3819;
  exports.ER_CHECK_CONSTRAINT_REFERS_UNKNOWN_COLUMN = 3820;
  exports.ER_CHECK_CONSTRAINT_NOT_FOUND = 3821;
  exports.ER_CHECK_CONSTRAINT_DUP_NAME = 3822;
  exports.ER_CHECK_CONSTRAINT_CLAUSE_USING_FK_REFER_ACTION_COLUMN = 3823;
  exports.WARN_UNENCRYPTED_TABLE_IN_ENCRYPTED_DB = 3824;
  exports.ER_INVALID_ENCRYPTION_REQUEST = 3825;
  exports.ER_CANNOT_SET_TABLE_ENCRYPTION = 3826;
  exports.ER_CANNOT_SET_DATABASE_ENCRYPTION = 3827;
  exports.ER_CANNOT_SET_TABLESPACE_ENCRYPTION = 3828;
  exports.ER_TABLESPACE_CANNOT_BE_ENCRYPTED = 3829;
  exports.ER_TABLESPACE_CANNOT_BE_DECRYPTED = 3830;
  exports.ER_TABLESPACE_TYPE_UNKNOWN = 3831;
  exports.ER_TARGET_TABLESPACE_UNENCRYPTED = 3832;
  exports.ER_CANNOT_USE_ENCRYPTION_CLAUSE = 3833;
  exports.ER_INVALID_MULTIPLE_CLAUSES = 3834;
  exports.ER_UNSUPPORTED_USE_OF_GRANT_AS = 3835;
  exports.ER_UKNOWN_AUTH_ID_OR_ACCESS_DENIED_FOR_GRANT_AS = 3836;
  exports.ER_DEPENDENT_BY_FUNCTIONAL_INDEX = 3837;
  exports.ER_PLUGIN_NOT_EARLY = 3838;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_START_SUBDIR_PATH = 3839;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_START_TIMEOUT = 3840;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_DIRS_INVALID = 3841;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_LABEL_NOT_FOUND = 3842;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_DIR_EMPTY = 3843;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_NO_SUCH_DIR = 3844;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_DIR_CLASH = 3845;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_DIR_PERMISSIONS = 3846;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_FILE_CREATE = 3847;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_ACTIVE = 3848;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_INACTIVE = 3849;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_FAILED = 3850;
  exports.ER_INNODB_REDO_LOG_ARCHIVE_SESSION = 3851;
  exports.ER_STD_REGEX_ERROR = 3852;
  exports.ER_INVALID_JSON_TYPE = 3853;
  exports.ER_CANNOT_CONVERT_STRING = 3854;
  exports.ER_DEPENDENT_BY_PARTITION_FUNC = 3855;
  exports.ER_WARN_DEPRECATED_FLOAT_AUTO_INCREMENT = 3856;
  exports.ER_RPL_CANT_STOP_REPLICA_WHILE_LOCKED_BACKUP = 3857;
  exports.ER_WARN_DEPRECATED_FLOAT_DIGITS = 3858;
  exports.ER_WARN_DEPRECATED_FLOAT_UNSIGNED = 3859;
  exports.ER_WARN_DEPRECATED_INTEGER_DISPLAY_WIDTH = 3860;
  exports.ER_WARN_DEPRECATED_ZEROFILL = 3861;
  exports.ER_CLONE_DONOR = 3862;
  exports.ER_CLONE_PROTOCOL = 3863;
  exports.ER_CLONE_DONOR_VERSION = 3864;
  exports.ER_CLONE_OS = 3865;
  exports.ER_CLONE_PLATFORM = 3866;
  exports.ER_CLONE_CHARSET = 3867;
  exports.ER_CLONE_CONFIG = 3868;
  exports.ER_CLONE_SYS_CONFIG = 3869;
  exports.ER_CLONE_PLUGIN_MATCH = 3870;
  exports.ER_CLONE_LOOPBACK = 3871;
  exports.ER_CLONE_ENCRYPTION = 3872;
  exports.ER_CLONE_DISK_SPACE = 3873;
  exports.ER_CLONE_IN_PROGRESS = 3874;
  exports.ER_CLONE_DISALLOWED = 3875;
  exports.ER_CANNOT_GRANT_ROLES_TO_ANONYMOUS_USER = 3876;
  exports.ER_SECONDARY_ENGINE_PLUGIN = 3877;
  exports.ER_SECOND_PASSWORD_CANNOT_BE_EMPTY = 3878;
  exports.ER_DB_ACCESS_DENIED = 3879;
  exports.ER_DA_AUTH_ID_WITH_SYSTEM_USER_PRIV_IN_MANDATORY_ROLES = 3880;
  exports.ER_DA_RPL_GTID_TABLE_CANNOT_OPEN = 3881;
  exports.ER_GEOMETRY_IN_UNKNOWN_LENGTH_UNIT = 3882;
  exports.ER_DA_PLUGIN_INSTALL_ERROR = 3883;
  exports.ER_NO_SESSION_TEMP = 3884;
  exports.ER_DA_UNKNOWN_ERROR_NUMBER = 3885;
  exports.ER_COLUMN_CHANGE_SIZE = 3886;
  exports.ER_REGEXP_INVALID_CAPTURE_GROUP_NAME = 3887;
  exports.ER_DA_SSL_LIBRARY_ERROR = 3888;
  exports.ER_SECONDARY_ENGINE = 3889;
  exports.ER_SECONDARY_ENGINE_DDL = 3890;
  exports.ER_INCORRECT_CURRENT_PASSWORD = 3891;
  exports.ER_MISSING_CURRENT_PASSWORD = 3892;
  exports.ER_CURRENT_PASSWORD_NOT_REQUIRED = 3893;
  exports.ER_PASSWORD_CANNOT_BE_RETAINED_ON_PLUGIN_CHANGE = 3894;
  exports.ER_CURRENT_PASSWORD_CANNOT_BE_RETAINED = 3895;
  exports.ER_PARTIAL_REVOKES_EXIST = 3896;
  exports.ER_CANNOT_GRANT_SYSTEM_PRIV_TO_MANDATORY_ROLE = 3897;
  exports.ER_XA_REPLICATION_FILTERS = 3898;
  exports.ER_UNSUPPORTED_SQL_MODE = 3899;
  exports.ER_REGEXP_INVALID_FLAG = 3900;
  exports.ER_PARTIAL_REVOKE_AND_DB_GRANT_BOTH_EXISTS = 3901;
  exports.ER_UNIT_NOT_FOUND = 3902;
  exports.ER_INVALID_JSON_VALUE_FOR_FUNC_INDEX = 3903;
  exports.ER_JSON_VALUE_OUT_OF_RANGE_FOR_FUNC_INDEX = 3904;
  exports.ER_EXCEEDED_MV_KEYS_NUM = 3905;
  exports.ER_EXCEEDED_MV_KEYS_SPACE = 3906;
  exports.ER_FUNCTIONAL_INDEX_DATA_IS_TOO_LONG = 3907;
  exports.ER_WRONG_MVI_VALUE = 3908;
  exports.ER_WARN_FUNC_INDEX_NOT_APPLICABLE = 3909;
  exports.ER_GRP_RPL_UDF_ERROR = 3910;
  exports.ER_UPDATE_GTID_PURGED_WITH_GR = 3911;
  exports.ER_GROUPING_ON_TIMESTAMP_IN_DST = 3912;
  exports.ER_TABLE_NAME_CAUSES_TOO_LONG_PATH = 3913;
  exports.ER_AUDIT_LOG_INSUFFICIENT_PRIVILEGE = 3914;
  exports.ER_AUDIT_LOG_PASSWORD_HAS_BEEN_COPIED = 3915;
  exports.ER_DA_GRP_RPL_STARTED_AUTO_REJOIN = 3916;
  exports.ER_SYSVAR_CHANGE_DURING_QUERY = 3917;
  exports.ER_GLOBSTAT_CHANGE_DURING_QUERY = 3918;
  exports.ER_GRP_RPL_MESSAGE_SERVICE_INIT_FAILURE = 3919;
  exports.ER_CHANGE_SOURCE_WRONG_COMPRESSION_ALGORITHM_CLIENT = 3920;
  exports.ER_CHANGE_SOURCE_WRONG_COMPRESSION_LEVEL_CLIENT = 3921;
  exports.ER_WRONG_COMPRESSION_ALGORITHM_CLIENT = 3922;
  exports.ER_WRONG_COMPRESSION_LEVEL_CLIENT = 3923;
  exports.ER_CHANGE_SOURCE_WRONG_COMPRESSION_ALGORITHM_LIST_CLIENT = 3924;
  exports.ER_CLIENT_PRIVILEGE_CHECKS_USER_CANNOT_BE_ANONYMOUS = 3925;
  exports.ER_CLIENT_PRIVILEGE_CHECKS_USER_DOES_NOT_EXIST = 3926;
  exports.ER_CLIENT_PRIVILEGE_CHECKS_USER_CORRUPT = 3927;
  exports.ER_CLIENT_PRIVILEGE_CHECKS_USER_NEEDS_RPL_APPLIER_PRIV = 3928;
  exports.ER_WARN_DA_PRIVILEGE_NOT_REGISTERED = 3929;
  exports.ER_CLIENT_KEYRING_UDF_KEY_INVALID = 3930;
  exports.ER_CLIENT_KEYRING_UDF_KEY_TYPE_INVALID = 3931;
  exports.ER_CLIENT_KEYRING_UDF_KEY_TOO_LONG = 3932;
  exports.ER_CLIENT_KEYRING_UDF_KEY_TYPE_TOO_LONG = 3933;
  exports.ER_JSON_SCHEMA_VALIDATION_ERROR_WITH_DETAILED_REPORT = 3934;
  exports.ER_DA_UDF_INVALID_CHARSET_SPECIFIED = 3935;
  exports.ER_DA_UDF_INVALID_CHARSET = 3936;
  exports.ER_DA_UDF_INVALID_COLLATION = 3937;
  exports.ER_DA_UDF_INVALID_EXTENSION_ARGUMENT_TYPE = 3938;
  exports.ER_MULTIPLE_CONSTRAINTS_WITH_SAME_NAME = 3939;
  exports.ER_CONSTRAINT_NOT_FOUND = 3940;
  exports.ER_ALTER_CONSTRAINT_ENFORCEMENT_NOT_SUPPORTED = 3941;
  exports.ER_TABLE_VALUE_CONSTRUCTOR_MUST_HAVE_COLUMNS = 3942;
  exports.ER_TABLE_VALUE_CONSTRUCTOR_CANNOT_HAVE_DEFAULT = 3943;
  exports.ER_CLIENT_QUERY_FAILURE_INVALID_NON_ROW_FORMAT = 3944;
  exports.ER_REQUIRE_ROW_FORMAT_INVALID_VALUE = 3945;
  exports.ER_FAILED_TO_DETERMINE_IF_ROLE_IS_MANDATORY = 3946;
  exports.ER_FAILED_TO_FETCH_MANDATORY_ROLE_LIST = 3947;
  exports.ER_CLIENT_LOCAL_FILES_DISABLED = 3948;
  exports.ER_IMP_INCOMPATIBLE_CFG_VERSION = 3949;
  exports.ER_DA_OOM = 3950;
  exports.ER_DA_UDF_INVALID_ARGUMENT_TO_SET_CHARSET = 3951;
  exports.ER_DA_UDF_INVALID_RETURN_TYPE_TO_SET_CHARSET = 3952;
  exports.ER_MULTIPLE_INTO_CLAUSES = 3953;
  exports.ER_MISPLACED_INTO = 3954;
  exports.ER_USER_ACCESS_DENIED_FOR_USER_ACCOUNT_BLOCKED_BY_PASSWORD_LOCK = 3955;
  exports.ER_WARN_DEPRECATED_YEAR_UNSIGNED = 3956;
  exports.ER_CLONE_NETWORK_PACKET = 3957;
  exports.ER_SDI_OPERATION_FAILED_MISSING_RECORD = 3958;
  exports.ER_DEPENDENT_BY_CHECK_CONSTRAINT = 3959;
  exports.ER_GRP_OPERATION_NOT_ALLOWED_GR_MUST_STOP = 3960;
  exports.ER_WARN_DEPRECATED_JSON_TABLE_ON_ERROR_ON_EMPTY = 3961;
  exports.ER_WARN_DEPRECATED_INNER_INTO = 3962;
  exports.ER_WARN_DEPRECATED_VALUES_FUNCTION_ALWAYS_NULL = 3963;
  exports.ER_WARN_DEPRECATED_SQL_CALC_FOUND_ROWS = 3964;
  exports.ER_WARN_DEPRECATED_FOUND_ROWS = 3965;
  exports.ER_MISSING_JSON_VALUE = 3966;
  exports.ER_MULTIPLE_JSON_VALUES = 3967;
  exports.ER_HOSTNAME_TOO_LONG = 3968;
  exports.ER_WARN_CLIENT_DEPRECATED_PARTITION_PREFIX_KEY = 3969;
  exports.ER_GROUP_REPLICATION_USER_EMPTY_MSG = 3970;
  exports.ER_GROUP_REPLICATION_USER_MANDATORY_MSG = 3971;
  exports.ER_GROUP_REPLICATION_PASSWORD_LENGTH = 3972;
  exports.ER_SUBQUERY_TRANSFORM_REJECTED = 3973;
  exports.ER_DA_GRP_RPL_RECOVERY_ENDPOINT_FORMAT = 3974;
  exports.ER_DA_GRP_RPL_RECOVERY_ENDPOINT_INVALID = 3975;
  exports.ER_WRONG_VALUE_FOR_VAR_PLUS_ACTIONABLE_PART = 3976;
  exports.ER_STATEMENT_NOT_ALLOWED_AFTER_START_TRANSACTION = 3977;
  exports.ER_FOREIGN_KEY_WITH_ATOMIC_CREATE_SELECT = 3978;
  exports.ER_NOT_ALLOWED_WITH_START_TRANSACTION = 3979;
  exports.ER_INVALID_JSON_ATTRIBUTE = 3980;
  exports.ER_ENGINE_ATTRIBUTE_NOT_SUPPORTED = 3981;
  exports.ER_INVALID_USER_ATTRIBUTE_JSON = 3982;
  exports.ER_INNODB_REDO_DISABLED = 3983;
  exports.ER_INNODB_REDO_ARCHIVING_ENABLED = 3984;
  exports.ER_MDL_OUT_OF_RESOURCES = 3985;
  exports.ER_IMPLICIT_COMPARISON_FOR_JSON = 3986;
  exports.ER_FUNCTION_DOES_NOT_SUPPORT_CHARACTER_SET = 3987;
  exports.ER_IMPOSSIBLE_STRING_CONVERSION = 3988;
  exports.ER_SCHEMA_READ_ONLY = 3989;
  exports.ER_RPL_ASYNC_RECONNECT_GTID_MODE_OFF = 3990;
  exports.ER_RPL_ASYNC_RECONNECT_AUTO_POSITION_OFF = 3991;
  exports.ER_DISABLE_GTID_MODE_REQUIRES_ASYNC_RECONNECT_OFF = 3992;
  exports.ER_DISABLE_AUTO_POSITION_REQUIRES_ASYNC_RECONNECT_OFF = 3993;
  exports.ER_INVALID_PARAMETER_USE = 3994;
  exports.ER_CHARACTER_SET_MISMATCH = 3995;
  exports.ER_WARN_VAR_VALUE_CHANGE_NOT_SUPPORTED = 3996;
  exports.ER_INVALID_TIME_ZONE_INTERVAL = 3997;
  exports.ER_INVALID_CAST = 3998;
  exports.ER_HYPERGRAPH_NOT_SUPPORTED_YET = 3999;
  exports.ER_WARN_HYPERGRAPH_EXPERIMENTAL = 4e3;
  exports.ER_DA_NO_ERROR_LOG_PARSER_CONFIGURED = 4001;
  exports.ER_DA_ERROR_LOG_TABLE_DISABLED = 4002;
  exports.ER_DA_ERROR_LOG_MULTIPLE_FILTERS = 4003;
  exports.ER_DA_CANT_OPEN_ERROR_LOG = 4004;
  exports.ER_USER_REFERENCED_AS_DEFINER = 4005;
  exports.ER_CANNOT_USER_REFERENCED_AS_DEFINER = 4006;
  exports.ER_REGEX_NUMBER_TOO_BIG = 4007;
  exports.ER_SPVAR_NONINTEGER_TYPE = 4008;
  exports.WARN_UNSUPPORTED_ACL_TABLES_READ = 4009;
  exports.ER_BINLOG_UNSAFE_ACL_TABLE_READ_IN_DML_DDL = 4010;
  exports.ER_STOP_REPLICA_MONITOR_IO_THREAD_TIMEOUT = 4011;
  exports.ER_STARTING_REPLICA_MONITOR_IO_THREAD = 4012;
  exports.ER_CANT_USE_ANONYMOUS_TO_GTID_WITH_GTID_MODE_NOT_ON = 4013;
  exports.ER_CANT_COMBINE_ANONYMOUS_TO_GTID_AND_AUTOPOSITION = 4014;
  exports.ER_ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS_REQUIRES_GTID_MODE_ON = 4015;
  exports.ER_SQL_REPLICA_SKIP_COUNTER_USED_WITH_GTID_MODE_ON = 4016;
  exports.ER_USING_ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS_AS_LOCAL_OR_UUID = 4017;
  exports.ER_CANT_SET_ANONYMOUS_TO_GTID_AND_WAIT_UNTIL_SQL_THD_AFTER_GTIDS = 4018;
  exports.ER_CANT_SET_SQL_AFTER_OR_BEFORE_GTIDS_WITH_ANONYMOUS_TO_GTID = 4019;
  exports.ER_ANONYMOUS_TO_GTID_UUID_SAME_AS_GROUP_NAME = 4020;
  exports.ER_CANT_USE_SAME_UUID_AS_GROUP_NAME = 4021;
  exports.ER_GRP_RPL_RECOVERY_CHANNEL_STILL_RUNNING = 4022;
  exports.ER_INNODB_INVALID_AUTOEXTEND_SIZE_VALUE = 4023;
  exports.ER_INNODB_INCOMPATIBLE_WITH_TABLESPACE = 4024;
  exports.ER_INNODB_AUTOEXTEND_SIZE_OUT_OF_RANGE = 4025;
  exports.ER_CANNOT_USE_AUTOEXTEND_SIZE_CLAUSE = 4026;
  exports.ER_ROLE_GRANTED_TO_ITSELF = 4027;
  exports.ER_TABLE_MUST_HAVE_A_VISIBLE_COLUMN = 4028;
  exports.ER_INNODB_COMPRESSION_FAILURE = 4029;
  exports.ER_WARN_ASYNC_CONN_FAILOVER_NETWORK_NAMESPACE = 4030;
  exports.ER_CLIENT_INTERACTION_TIMEOUT = 4031;
  exports.ER_INVALID_CAST_TO_GEOMETRY = 4032;
  exports.ER_INVALID_CAST_POLYGON_RING_DIRECTION = 4033;
  exports.ER_GIS_DIFFERENT_SRIDS_AGGREGATION = 4034;
  exports.ER_RELOAD_KEYRING_FAILURE = 4035;
  exports.ER_SDI_GET_KEYS_INVALID_TABLESPACE = 4036;
  exports.ER_CHANGE_RPL_SRC_WRONG_COMPRESSION_ALGORITHM_SIZE = 4037;
  exports.ER_WARN_DEPRECATED_TLS_VERSION_FOR_CHANNEL_CLI = 4038;
  exports.ER_CANT_USE_SAME_UUID_AS_VIEW_CHANGE_UUID = 4039;
  exports.ER_ANONYMOUS_TO_GTID_UUID_SAME_AS_VIEW_CHANGE_UUID = 4040;
  exports.ER_GRP_RPL_VIEW_CHANGE_UUID_FAIL_GET_VARIABLE = 4041;
  exports.ER_WARN_ADUIT_LOG_MAX_SIZE_AND_PRUNE_SECONDS = 4042;
  exports.ER_WARN_ADUIT_LOG_MAX_SIZE_CLOSE_TO_ROTATE_ON_SIZE = 4043;
  exports.ER_KERBEROS_CREATE_USER = 4044;
  exports.ER_INSTALL_PLUGIN_CONFLICT_CLIENT = 4045;
  exports.ER_DA_ERROR_LOG_COMPONENT_FLUSH_FAILED = 4046;
  exports.ER_WARN_SQL_AFTER_MTS_GAPS_GAP_NOT_CALCULATED = 4047;
  exports.ER_INVALID_ASSIGNMENT_TARGET = 4048;
  exports.ER_OPERATION_NOT_ALLOWED_ON_GR_SECONDARY = 4049;
  exports.ER_GRP_RPL_FAILOVER_CHANNEL_STATUS_PROPAGATION = 4050;
  exports.ER_WARN_AUDIT_LOG_FORMAT_UNIX_TIMESTAMP_ONLY_WHEN_JSON = 4051;
  exports.ER_INVALID_MFA_PLUGIN_SPECIFIED = 4052;
  exports.ER_IDENTIFIED_BY_UNSUPPORTED = 4053;
  exports.ER_INVALID_PLUGIN_FOR_REGISTRATION = 4054;
  exports.ER_PLUGIN_REQUIRES_REGISTRATION = 4055;
  exports.ER_MFA_METHOD_EXISTS = 4056;
  exports.ER_MFA_METHOD_NOT_EXISTS = 4057;
  exports.ER_AUTHENTICATION_POLICY_MISMATCH = 4058;
  exports.ER_PLUGIN_REGISTRATION_DONE = 4059;
  exports.ER_INVALID_USER_FOR_REGISTRATION = 4060;
  exports.ER_USER_REGISTRATION_FAILED = 4061;
  exports.ER_MFA_METHODS_INVALID_ORDER = 4062;
  exports.ER_MFA_METHODS_IDENTICAL = 4063;
  exports.ER_INVALID_MFA_OPERATIONS_FOR_PASSWORDLESS_USER = 4064;
  exports.ER_CHANGE_REPLICATION_SOURCE_NO_OPTIONS_FOR_GTID_ONLY = 4065;
  exports.ER_CHANGE_REP_SOURCE_CANT_DISABLE_REQ_ROW_FORMAT_WITH_GTID_ONLY = 4066;
  exports.ER_CHANGE_REP_SOURCE_CANT_DISABLE_AUTO_POSITION_WITH_GTID_ONLY = 4067;
  exports.ER_CHANGE_REP_SOURCE_CANT_DISABLE_GTID_ONLY_WITHOUT_POSITIONS = 4068;
  exports.ER_CHANGE_REP_SOURCE_CANT_DISABLE_AUTO_POS_WITHOUT_POSITIONS = 4069;
  exports.ER_CHANGE_REP_SOURCE_GR_CHANNEL_WITH_GTID_MODE_NOT_ON = 4070;
  exports.ER_CANT_USE_GTID_ONLY_WITH_GTID_MODE_NOT_ON = 4071;
  exports.ER_WARN_C_DISABLE_GTID_ONLY_WITH_SOURCE_AUTO_POS_INVALID_POS = 4072;
  exports.ER_DA_SSL_FIPS_MODE_ERROR = 4073;
  exports.ER_VALUE_OUT_OF_RANGE = 4074;
  exports.ER_FULLTEXT_WITH_ROLLUP = 4075;
  exports.ER_REGEXP_MISSING_RESOURCE = 4076;
  exports.ER_WARN_REGEXP_USING_DEFAULT = 4077;
  exports.ER_REGEXP_MISSING_FILE = 4078;
  exports.ER_WARN_DEPRECATED_COLLATION = 4079;
  exports.ER_CONCURRENT_PROCEDURE_USAGE = 4080;
  exports.ER_DA_GLOBAL_CONN_LIMIT = 4081;
  exports.ER_DA_CONN_LIMIT = 4082;
  exports.ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COLUMN_TYPE_INSTANT = 4083;
  exports.ER_WARN_SF_UDF_NAME_COLLISION = 4084;
  exports.ER_CANNOT_PURGE_BINLOG_WITH_BACKUP_LOCK = 4085;
  exports.ER_TOO_MANY_WINDOWS = 4086;
  exports.ER_MYSQLBACKUP_CLIENT_MSG = 4087;
  exports.ER_COMMENT_CONTAINS_INVALID_STRING = 4088;
  exports.ER_DEFINITION_CONTAINS_INVALID_STRING = 4089;
  exports.ER_CANT_EXECUTE_COMMAND_WITH_ASSIGNED_GTID_NEXT = 4090;
  exports.ER_XA_TEMP_TABLE = 4091;
  exports.ER_INNODB_MAX_ROW_VERSION = 4092;
  exports.ER_INNODB_INSTANT_ADD_NOT_SUPPORTED_MAX_SIZE = 4093;
  exports.ER_OPERATION_NOT_ALLOWED_WHILE_PRIMARY_CHANGE_IS_RUNNING = 4094;
  exports.ER_WARN_DEPRECATED_DATETIME_DELIMITER = 4095;
  exports.ER_WARN_DEPRECATED_SUPERFLUOUS_DELIMITER = 4096;
  exports.ER_CANNOT_PERSIST_SENSITIVE_VARIABLES = 4097;
  exports.ER_WARN_CANNOT_SECURELY_PERSIST_SENSITIVE_VARIABLES = 4098;
  exports.ER_WARN_TRG_ALREADY_EXISTS = 4099;
  exports.ER_IF_NOT_EXISTS_UNSUPPORTED_TRG_EXISTS_ON_DIFFERENT_TABLE = 4100;
  exports.ER_IF_NOT_EXISTS_UNSUPPORTED_UDF_NATIVE_FCT_NAME_COLLISION = 4101;
  exports.ER_SET_PASSWORD_AUTH_PLUGIN_ERROR = 4102;
  exports.ER_REDUCED_DBLWR_FILE_CORRUPTED = 4103;
  exports.ER_REDUCED_DBLWR_PAGE_FOUND = 4104;
  exports.ER_SRS_INVALID_LATITUDE_OF_ORIGIN = 4105;
  exports.ER_SRS_INVALID_LONGITUDE_OF_ORIGIN = 4106;
  exports.ER_SRS_UNUSED_PROJ_PARAMETER_PRESENT = 4107;
  exports.ER_GIPK_COLUMN_EXISTS = 4108;
  exports.ER_GIPK_FAILED_AUTOINC_COLUMN_EXISTS = 4109;
  exports.ER_GIPK_COLUMN_ALTER_NOT_ALLOWED = 4110;
  exports.ER_DROP_PK_COLUMN_TO_DROP_GIPK = 4111;
  exports.ER_CREATE_SELECT_WITH_GIPK_DISALLOWED_IN_SBR = 4112;
  exports.ER_DA_EXPIRE_LOGS_DAYS_IGNORED = 4113;
  exports.ER_CTE_RECURSIVE_NOT_UNION = 4114;
  exports.ER_COMMAND_BACKEND_FAILED_TO_FETCH_SECURITY_CTX = 4115;
  exports.ER_COMMAND_SERVICE_BACKEND_FAILED = 4116;
  exports.ER_CLIENT_FILE_PRIVILEGE_FOR_REPLICATION_CHECKS = 4117;
  exports.ER_GROUP_REPLICATION_FORCE_MEMBERS_COMMAND_FAILURE = 4118;
  exports.ER_WARN_DEPRECATED_IDENT = 4119;
  exports.ER_INTERSECT_ALL_MAX_DUPLICATES_EXCEEDED = 4120;
  exports.ER_TP_QUERY_THRS_PER_GRP_EXCEEDS_TXN_THR_LIMIT = 4121;
  exports.ER_BAD_TIMESTAMP_FORMAT = 4122;
  exports.ER_SHAPE_PRIDICTION_UDF = 4123;
  exports.ER_SRS_INVALID_HEIGHT = 4124;
  exports.ER_SRS_INVALID_SCALING = 4125;
  exports.ER_SRS_INVALID_ZONE_WIDTH = 4126;
  exports.ER_SRS_INVALID_LATITUDE_POLAR_STERE_VAR_A = 4127;
  exports.ER_WARN_DEPRECATED_CLIENT_NO_SCHEMA_OPTION = 4128;
  exports.ER_TABLE_NOT_EMPTY = 4129;
  exports.ER_TABLE_NO_PRIMARY_KEY = 4130;
  exports.ER_TABLE_IN_SHARED_TABLESPACE = 4131;
  exports.ER_INDEX_OTHER_THAN_PK = 4132;
  exports.ER_LOAD_BULK_DATA_UNSORTED = 4133;
  exports.ER_BULK_EXECUTOR_ERROR = 4134;
  exports.ER_BULK_READER_LIBCURL_INIT_FAILED = 4135;
  exports.ER_BULK_READER_LIBCURL_ERROR = 4136;
  exports.ER_BULK_READER_SERVER_ERROR = 4137;
  exports.ER_BULK_READER_COMMUNICATION_ERROR = 4138;
  exports.ER_BULK_LOAD_DATA_FAILED = 4139;
  exports.ER_BULK_LOADER_COLUMN_TOO_BIG_FOR_LEFTOVER_BUFFER = 4140;
  exports.ER_BULK_LOADER_COMPONENT_ERROR = 4141;
  exports.ER_BULK_LOADER_FILE_CONTAINS_LESS_LINES_THAN_IGNORE_CLAUSE = 4142;
  exports.ER_BULK_PARSER_MISSING_ENCLOSED_BY = 4143;
  exports.ER_BULK_PARSER_ROW_BUFFER_MAX_TOTAL_COLS_EXCEEDED = 4144;
  exports.ER_BULK_PARSER_COPY_BUFFER_SIZE_EXCEEDED = 4145;
  exports.ER_BULK_PARSER_UNEXPECTED_END_OF_INPUT = 4146;
  exports.ER_BULK_PARSER_UNEXPECTED_ROW_TERMINATOR = 4147;
  exports.ER_BULK_PARSER_UNEXPECTED_CHAR_AFTER_ENDING_ENCLOSED_BY = 4148;
  exports.ER_BULK_PARSER_UNEXPECTED_CHAR_AFTER_NULL_ESCAPE = 4149;
  exports.ER_BULK_PARSER_UNEXPECTED_CHAR_AFTER_COLUMN_TERMINATOR = 4150;
  exports.ER_BULK_PARSER_INCOMPLETE_ESCAPE_SEQUENCE = 4151;
  exports.ER_LOAD_BULK_DATA_FAILED = 4152;
  exports.ER_LOAD_BULK_DATA_WRONG_VALUE_FOR_FIELD = 4153;
  exports.ER_LOAD_BULK_DATA_WARN_NULL_TO_NOTNULL = 4154;
  exports.ER_REQUIRE_TABLE_PRIMARY_KEY_CHECK_GENERATE_WITH_GR = 4155;
  exports.ER_CANT_CHANGE_SYS_VAR_IN_READ_ONLY_MODE = 4156;
  exports.ER_INNODB_INSTANT_ADD_DROP_NOT_SUPPORTED_MAX_SIZE = 4157;
  exports.ER_INNODB_INSTANT_ADD_NOT_SUPPORTED_MAX_FIELDS = 4158;
  exports.ER_CANT_SET_PERSISTED = 4159;
  exports.ER_INSTALL_COMPONENT_SET_NULL_VALUE = 4160;
  exports.ER_INSTALL_COMPONENT_SET_UNUSED_VALUE = 4161;
  exports.ER_WARN_DEPRECATED_USER_DEFINED_COLLATIONS = 4162;
  exports[1] = "EE_CANTCREATEFILE";
  exports[2] = "EE_READ";
  exports[3] = "EE_WRITE";
  exports[4] = "EE_BADCLOSE";
  exports[5] = "EE_OUTOFMEMORY";
  exports[6] = "EE_DELETE";
  exports[7] = "EE_LINK";
  exports[9] = "EE_EOFERR";
  exports[10] = "EE_CANTLOCK";
  exports[11] = "EE_CANTUNLOCK";
  exports[12] = "EE_DIR";
  exports[13] = "EE_STAT";
  exports[14] = "EE_CANT_CHSIZE";
  exports[15] = "EE_CANT_OPEN_STREAM";
  exports[16] = "EE_GETWD";
  exports[17] = "EE_SETWD";
  exports[18] = "EE_LINK_WARNING";
  exports[19] = "EE_OPEN_WARNING";
  exports[20] = "EE_DISK_FULL";
  exports[21] = "EE_CANT_MKDIR";
  exports[22] = "EE_UNKNOWN_CHARSET";
  exports[23] = "EE_OUT_OF_FILERESOURCES";
  exports[24] = "EE_CANT_READLINK";
  exports[25] = "EE_CANT_SYMLINK";
  exports[26] = "EE_REALPATH";
  exports[27] = "EE_SYNC";
  exports[28] = "EE_UNKNOWN_COLLATION";
  exports[29] = "EE_FILENOTFOUND";
  exports[30] = "EE_FILE_NOT_CLOSED";
  exports[31] = "EE_CHANGE_OWNERSHIP";
  exports[32] = "EE_CHANGE_PERMISSIONS";
  exports[33] = "EE_CANT_SEEK";
  exports[34] = "EE_CAPACITY_EXCEEDED";
  exports[35] = "EE_DISK_FULL_WITH_RETRY_MSG";
  exports[36] = "EE_FAILED_TO_CREATE_TIMER";
  exports[37] = "EE_FAILED_TO_DELETE_TIMER";
  exports[38] = "EE_FAILED_TO_CREATE_TIMER_QUEUE";
  exports[39] = "EE_FAILED_TO_START_TIMER_NOTIFY_THREAD";
  exports[40] = "EE_FAILED_TO_CREATE_TIMER_NOTIFY_THREAD_INTERRUPT_EVENT";
  exports[41] = "EE_EXITING_TIMER_NOTIFY_THREAD";
  exports[42] = "EE_WIN_LIBRARY_LOAD_FAILED";
  exports[43] = "EE_WIN_RUN_TIME_ERROR_CHECK";
  exports[44] = "EE_FAILED_TO_DETERMINE_LARGE_PAGE_SIZE";
  exports[45] = "EE_FAILED_TO_KILL_ALL_THREADS";
  exports[46] = "EE_FAILED_TO_CREATE_IO_COMPLETION_PORT";
  exports[47] = "EE_FAILED_TO_OPEN_DEFAULTS_FILE";
  exports[48] = "EE_FAILED_TO_HANDLE_DEFAULTS_FILE";
  exports[49] = "EE_WRONG_DIRECTIVE_IN_CONFIG_FILE";
  exports[50] = "EE_SKIPPING_DIRECTIVE_DUE_TO_MAX_INCLUDE_RECURSION";
  exports[51] = "EE_INCORRECT_GRP_DEFINITION_IN_CONFIG_FILE";
  exports[52] = "EE_OPTION_WITHOUT_GRP_IN_CONFIG_FILE";
  exports[53] = "EE_CONFIG_FILE_PERMISSION_ERROR";
  exports[54] = "EE_IGNORE_WORLD_WRITABLE_CONFIG_FILE";
  exports[55] = "EE_USING_DISABLED_OPTION";
  exports[56] = "EE_USING_DISABLED_SHORT_OPTION";
  exports[57] = "EE_USING_PASSWORD_ON_CLI_IS_INSECURE";
  exports[58] = "EE_UNKNOWN_SUFFIX_FOR_VARIABLE";
  exports[59] = "EE_SSL_ERROR_FROM_FILE";
  exports[60] = "EE_SSL_ERROR";
  exports[61] = "EE_NET_SEND_ERROR_IN_BOOTSTRAP";
  exports[62] = "EE_PACKETS_OUT_OF_ORDER";
  exports[63] = "EE_UNKNOWN_PROTOCOL_OPTION";
  exports[64] = "EE_FAILED_TO_LOCATE_SERVER_PUBLIC_KEY";
  exports[65] = "EE_PUBLIC_KEY_NOT_IN_PEM_FORMAT";
  exports[66] = "EE_DEBUG_INFO";
  exports[67] = "EE_UNKNOWN_VARIABLE";
  exports[68] = "EE_UNKNOWN_OPTION";
  exports[69] = "EE_UNKNOWN_SHORT_OPTION";
  exports[70] = "EE_OPTION_WITHOUT_ARGUMENT";
  exports[71] = "EE_OPTION_REQUIRES_ARGUMENT";
  exports[72] = "EE_SHORT_OPTION_REQUIRES_ARGUMENT";
  exports[73] = "EE_OPTION_IGNORED_DUE_TO_INVALID_VALUE";
  exports[74] = "EE_OPTION_WITH_EMPTY_VALUE";
  exports[75] = "EE_FAILED_TO_ASSIGN_MAX_VALUE_TO_OPTION";
  exports[76] = "EE_INCORRECT_BOOLEAN_VALUE_FOR_OPTION";
  exports[77] = "EE_FAILED_TO_SET_OPTION_VALUE";
  exports[78] = "EE_INCORRECT_INT_VALUE_FOR_OPTION";
  exports[79] = "EE_INCORRECT_UINT_VALUE_FOR_OPTION";
  exports[80] = "EE_ADJUSTED_SIGNED_VALUE_FOR_OPTION";
  exports[81] = "EE_ADJUSTED_UNSIGNED_VALUE_FOR_OPTION";
  exports[82] = "EE_ADJUSTED_ULONGLONG_VALUE_FOR_OPTION";
  exports[83] = "EE_ADJUSTED_DOUBLE_VALUE_FOR_OPTION";
  exports[84] = "EE_INVALID_DECIMAL_VALUE_FOR_OPTION";
  exports[85] = "EE_COLLATION_PARSER_ERROR";
  exports[86] = "EE_FAILED_TO_RESET_BEFORE_PRIMARY_IGNORABLE_CHAR";
  exports[87] = "EE_FAILED_TO_RESET_BEFORE_TERTIARY_IGNORABLE_CHAR";
  exports[88] = "EE_SHIFT_CHAR_OUT_OF_RANGE";
  exports[89] = "EE_RESET_CHAR_OUT_OF_RANGE";
  exports[90] = "EE_UNKNOWN_LDML_TAG";
  exports[91] = "EE_FAILED_TO_RESET_BEFORE_SECONDARY_IGNORABLE_CHAR";
  exports[92] = "EE_FAILED_PROCESSING_DIRECTIVE";
  exports[93] = "EE_PTHREAD_KILL_FAILED";
  exports[120] = "HA_ERR_KEY_NOT_FOUND";
  exports[121] = "HA_ERR_FOUND_DUPP_KEY";
  exports[122] = "HA_ERR_INTERNAL_ERROR";
  exports[123] = "HA_ERR_RECORD_CHANGED";
  exports[124] = "HA_ERR_WRONG_INDEX";
  exports[125] = "HA_ERR_ROLLED_BACK";
  exports[126] = "HA_ERR_CRASHED";
  exports[127] = "HA_ERR_WRONG_IN_RECORD";
  exports[128] = "HA_ERR_OUT_OF_MEM";
  exports[130] = "HA_ERR_NOT_A_TABLE";
  exports[131] = "HA_ERR_WRONG_COMMAND";
  exports[132] = "HA_ERR_OLD_FILE";
  exports[133] = "HA_ERR_NO_ACTIVE_RECORD";
  exports[134] = "HA_ERR_RECORD_DELETED";
  exports[135] = "HA_ERR_RECORD_FILE_FULL";
  exports[136] = "HA_ERR_INDEX_FILE_FULL";
  exports[137] = "HA_ERR_END_OF_FILE";
  exports[138] = "HA_ERR_UNSUPPORTED";
  exports[139] = "HA_ERR_TOO_BIG_ROW";
  exports[140] = "HA_WRONG_CREATE_OPTION";
  exports[141] = "HA_ERR_FOUND_DUPP_UNIQUE";
  exports[142] = "HA_ERR_UNKNOWN_CHARSET";
  exports[143] = "HA_ERR_WRONG_MRG_TABLE_DEF";
  exports[144] = "HA_ERR_CRASHED_ON_REPAIR";
  exports[145] = "HA_ERR_CRASHED_ON_USAGE";
  exports[146] = "HA_ERR_LOCK_WAIT_TIMEOUT";
  exports[147] = "HA_ERR_LOCK_TABLE_FULL";
  exports[148] = "HA_ERR_READ_ONLY_TRANSACTION";
  exports[149] = "HA_ERR_LOCK_DEADLOCK";
  exports[150] = "HA_ERR_CANNOT_ADD_FOREIGN";
  exports[151] = "HA_ERR_NO_REFERENCED_ROW";
  exports[152] = "HA_ERR_ROW_IS_REFERENCED";
  exports[153] = "HA_ERR_NO_SAVEPOINT";
  exports[154] = "HA_ERR_NON_UNIQUE_BLOCK_SIZE";
  exports[155] = "HA_ERR_NO_SUCH_TABLE";
  exports[156] = "HA_ERR_TABLE_EXIST";
  exports[157] = "HA_ERR_NO_CONNECTION";
  exports[158] = "HA_ERR_NULL_IN_SPATIAL";
  exports[159] = "HA_ERR_TABLE_DEF_CHANGED";
  exports[160] = "HA_ERR_NO_PARTITION_FOUND";
  exports[161] = "HA_ERR_RBR_LOGGING_FAILED";
  exports[162] = "HA_ERR_DROP_INDEX_FK";
  exports[163] = "HA_ERR_FOREIGN_DUPLICATE_KEY";
  exports[164] = "HA_ERR_TABLE_NEEDS_UPGRADE";
  exports[165] = "HA_ERR_TABLE_READONLY";
  exports[166] = "HA_ERR_AUTOINC_READ_FAILED";
  exports[167] = "HA_ERR_AUTOINC_ERANGE";
  exports[168] = "HA_ERR_GENERIC";
  exports[169] = "HA_ERR_RECORD_IS_THE_SAME";
  exports[170] = "HA_ERR_LOGGING_IMPOSSIBLE";
  exports[171] = "HA_ERR_CORRUPT_EVENT";
  exports[172] = "HA_ERR_NEW_FILE";
  exports[173] = "HA_ERR_ROWS_EVENT_APPLY";
  exports[174] = "HA_ERR_INITIALIZATION";
  exports[175] = "HA_ERR_FILE_TOO_SHORT";
  exports[176] = "HA_ERR_WRONG_CRC";
  exports[177] = "HA_ERR_TOO_MANY_CONCURRENT_TRXS";
  exports[178] = "HA_ERR_NOT_IN_LOCK_PARTITIONS";
  exports[179] = "HA_ERR_INDEX_COL_TOO_LONG";
  exports[180] = "HA_ERR_INDEX_CORRUPT";
  exports[181] = "HA_ERR_UNDO_REC_TOO_BIG";
  exports[182] = "HA_FTS_INVALID_DOCID";
  exports[183] = "HA_ERR_TABLE_IN_FK_CHECK";
  exports[184] = "HA_ERR_TABLESPACE_EXISTS";
  exports[185] = "HA_ERR_TOO_MANY_FIELDS";
  exports[186] = "HA_ERR_ROW_IN_WRONG_PARTITION";
  exports[187] = "HA_ERR_INNODB_READ_ONLY";
  exports[188] = "HA_ERR_FTS_EXCEED_RESULT_CACHE_LIMIT";
  exports[189] = "HA_ERR_TEMP_FILE_WRITE_FAILURE";
  exports[190] = "HA_ERR_INNODB_FORCED_RECOVERY";
  exports[191] = "HA_ERR_FTS_TOO_MANY_WORDS_IN_PHRASE";
  exports[192] = "HA_ERR_FK_DEPTH_EXCEEDED";
  exports[193] = "HA_MISSING_CREATE_OPTION";
  exports[194] = "HA_ERR_SE_OUT_OF_MEMORY";
  exports[195] = "HA_ERR_TABLE_CORRUPT";
  exports[196] = "HA_ERR_QUERY_INTERRUPTED";
  exports[197] = "HA_ERR_TABLESPACE_MISSING";
  exports[198] = "HA_ERR_TABLESPACE_IS_NOT_EMPTY";
  exports[199] = "HA_ERR_WRONG_FILE_NAME";
  exports[200] = "HA_ERR_NOT_ALLOWED_COMMAND";
  exports[201] = "HA_ERR_COMPUTE_FAILED";
  exports[202] = "HA_ERR_ROW_FORMAT_CHANGED";
  exports[203] = "HA_ERR_NO_WAIT_LOCK";
  exports[204] = "HA_ERR_DISK_FULL_NOWAIT";
  exports[205] = "HA_ERR_NO_SESSION_TEMP";
  exports[206] = "HA_ERR_WRONG_TABLE_NAME";
  exports[207] = "HA_ERR_TOO_LONG_PATH";
  exports[208] = "HA_ERR_SAMPLING_INIT_FAILED";
  exports[209] = "HA_ERR_FTS_TOO_MANY_NESTED_EXP";
  exports[1e3] = "ER_HASHCHK";
  exports[1001] = "ER_NISAMCHK";
  exports[1002] = "ER_NO";
  exports[1003] = "ER_YES";
  exports[1004] = "ER_CANT_CREATE_FILE";
  exports[1005] = "ER_CANT_CREATE_TABLE";
  exports[1006] = "ER_CANT_CREATE_DB";
  exports[1007] = "ER_DB_CREATE_EXISTS";
  exports[1008] = "ER_DB_DROP_EXISTS";
  exports[1009] = "ER_DB_DROP_DELETE";
  exports[1010] = "ER_DB_DROP_RMDIR";
  exports[1011] = "ER_CANT_DELETE_FILE";
  exports[1012] = "ER_CANT_FIND_SYSTEM_REC";
  exports[1013] = "ER_CANT_GET_STAT";
  exports[1014] = "ER_CANT_GET_WD";
  exports[1015] = "ER_CANT_LOCK";
  exports[1016] = "ER_CANT_OPEN_FILE";
  exports[1017] = "ER_FILE_NOT_FOUND";
  exports[1018] = "ER_CANT_READ_DIR";
  exports[1019] = "ER_CANT_SET_WD";
  exports[1020] = "ER_CHECKREAD";
  exports[1021] = "ER_DISK_FULL";
  exports[1022] = "ER_DUP_KEY";
  exports[1023] = "ER_ERROR_ON_CLOSE";
  exports[1024] = "ER_ERROR_ON_READ";
  exports[1025] = "ER_ERROR_ON_RENAME";
  exports[1026] = "ER_ERROR_ON_WRITE";
  exports[1027] = "ER_FILE_USED";
  exports[1028] = "ER_FILSORT_ABORT";
  exports[1029] = "ER_FORM_NOT_FOUND";
  exports[1030] = "ER_GET_ERRNO";
  exports[1031] = "ER_ILLEGAL_HA";
  exports[1032] = "ER_KEY_NOT_FOUND";
  exports[1033] = "ER_NOT_FORM_FILE";
  exports[1034] = "ER_NOT_KEYFILE";
  exports[1035] = "ER_OLD_KEYFILE";
  exports[1036] = "ER_OPEN_AS_READONLY";
  exports[1037] = "ER_OUTOFMEMORY";
  exports[1038] = "ER_OUT_OF_SORTMEMORY";
  exports[1039] = "ER_UNEXPECTED_EOF";
  exports[1040] = "ER_CON_COUNT_ERROR";
  exports[1041] = "ER_OUT_OF_RESOURCES";
  exports[1042] = "ER_BAD_HOST_ERROR";
  exports[1043] = "ER_HANDSHAKE_ERROR";
  exports[1044] = "ER_DBACCESS_DENIED_ERROR";
  exports[1045] = "ER_ACCESS_DENIED_ERROR";
  exports[1046] = "ER_NO_DB_ERROR";
  exports[1047] = "ER_UNKNOWN_COM_ERROR";
  exports[1048] = "ER_BAD_NULL_ERROR";
  exports[1049] = "ER_BAD_DB_ERROR";
  exports[1050] = "ER_TABLE_EXISTS_ERROR";
  exports[1051] = "ER_BAD_TABLE_ERROR";
  exports[1052] = "ER_NON_UNIQ_ERROR";
  exports[1053] = "ER_SERVER_SHUTDOWN";
  exports[1054] = "ER_BAD_FIELD_ERROR";
  exports[1055] = "ER_WRONG_FIELD_WITH_GROUP";
  exports[1056] = "ER_WRONG_GROUP_FIELD";
  exports[1057] = "ER_WRONG_SUM_SELECT";
  exports[1058] = "ER_WRONG_VALUE_COUNT";
  exports[1059] = "ER_TOO_LONG_IDENT";
  exports[1060] = "ER_DUP_FIELDNAME";
  exports[1061] = "ER_DUP_KEYNAME";
  exports[1062] = "ER_DUP_ENTRY";
  exports[1063] = "ER_WRONG_FIELD_SPEC";
  exports[1064] = "ER_PARSE_ERROR";
  exports[1065] = "ER_EMPTY_QUERY";
  exports[1066] = "ER_NONUNIQ_TABLE";
  exports[1067] = "ER_INVALID_DEFAULT";
  exports[1068] = "ER_MULTIPLE_PRI_KEY";
  exports[1069] = "ER_TOO_MANY_KEYS";
  exports[1070] = "ER_TOO_MANY_KEY_PARTS";
  exports[1071] = "ER_TOO_LONG_KEY";
  exports[1072] = "ER_KEY_COLUMN_DOES_NOT_EXITS";
  exports[1073] = "ER_BLOB_USED_AS_KEY";
  exports[1074] = "ER_TOO_BIG_FIELDLENGTH";
  exports[1075] = "ER_WRONG_AUTO_KEY";
  exports[1076] = "ER_READY";
  exports[1077] = "ER_NORMAL_SHUTDOWN";
  exports[1078] = "ER_GOT_SIGNAL";
  exports[1079] = "ER_SHUTDOWN_COMPLETE";
  exports[1080] = "ER_FORCING_CLOSE";
  exports[1081] = "ER_IPSOCK_ERROR";
  exports[1082] = "ER_NO_SUCH_INDEX";
  exports[1083] = "ER_WRONG_FIELD_TERMINATORS";
  exports[1084] = "ER_BLOBS_AND_NO_TERMINATED";
  exports[1085] = "ER_TEXTFILE_NOT_READABLE";
  exports[1086] = "ER_FILE_EXISTS_ERROR";
  exports[1087] = "ER_LOAD_INFO";
  exports[1088] = "ER_ALTER_INFO";
  exports[1089] = "ER_WRONG_SUB_KEY";
  exports[1090] = "ER_CANT_REMOVE_ALL_FIELDS";
  exports[1091] = "ER_CANT_DROP_FIELD_OR_KEY";
  exports[1092] = "ER_INSERT_INFO";
  exports[1093] = "ER_UPDATE_TABLE_USED";
  exports[1094] = "ER_NO_SUCH_THREAD";
  exports[1095] = "ER_KILL_DENIED_ERROR";
  exports[1096] = "ER_NO_TABLES_USED";
  exports[1097] = "ER_TOO_BIG_SET";
  exports[1098] = "ER_NO_UNIQUE_LOGFILE";
  exports[1099] = "ER_TABLE_NOT_LOCKED_FOR_WRITE";
  exports[1100] = "ER_TABLE_NOT_LOCKED";
  exports[1101] = "ER_BLOB_CANT_HAVE_DEFAULT";
  exports[1102] = "ER_WRONG_DB_NAME";
  exports[1103] = "ER_WRONG_TABLE_NAME";
  exports[1104] = "ER_TOO_BIG_SELECT";
  exports[1105] = "ER_UNKNOWN_ERROR";
  exports[1106] = "ER_UNKNOWN_PROCEDURE";
  exports[1107] = "ER_WRONG_PARAMCOUNT_TO_PROCEDURE";
  exports[1108] = "ER_WRONG_PARAMETERS_TO_PROCEDURE";
  exports[1109] = "ER_UNKNOWN_TABLE";
  exports[1110] = "ER_FIELD_SPECIFIED_TWICE";
  exports[1111] = "ER_INVALID_GROUP_FUNC_USE";
  exports[1112] = "ER_UNSUPPORTED_EXTENSION";
  exports[1113] = "ER_TABLE_MUST_HAVE_COLUMNS";
  exports[1114] = "ER_RECORD_FILE_FULL";
  exports[1115] = "ER_UNKNOWN_CHARACTER_SET";
  exports[1116] = "ER_TOO_MANY_TABLES";
  exports[1117] = "ER_TOO_MANY_FIELDS";
  exports[1118] = "ER_TOO_BIG_ROWSIZE";
  exports[1119] = "ER_STACK_OVERRUN";
  exports[1120] = "ER_WRONG_OUTER_JOIN";
  exports[1121] = "ER_NULL_COLUMN_IN_INDEX";
  exports[1122] = "ER_CANT_FIND_UDF";
  exports[1123] = "ER_CANT_INITIALIZE_UDF";
  exports[1124] = "ER_UDF_NO_PATHS";
  exports[1125] = "ER_UDF_EXISTS";
  exports[1126] = "ER_CANT_OPEN_LIBRARY";
  exports[1127] = "ER_CANT_FIND_DL_ENTRY";
  exports[1128] = "ER_FUNCTION_NOT_DEFINED";
  exports[1129] = "ER_HOST_IS_BLOCKED";
  exports[1130] = "ER_HOST_NOT_PRIVILEGED";
  exports[1131] = "ER_PASSWORD_ANONYMOUS_USER";
  exports[1132] = "ER_PASSWORD_NOT_ALLOWED";
  exports[1133] = "ER_PASSWORD_NO_MATCH";
  exports[1134] = "ER_UPDATE_INFO";
  exports[1135] = "ER_CANT_CREATE_THREAD";
  exports[1136] = "ER_WRONG_VALUE_COUNT_ON_ROW";
  exports[1137] = "ER_CANT_REOPEN_TABLE";
  exports[1138] = "ER_INVALID_USE_OF_NULL";
  exports[1139] = "ER_REGEXP_ERROR";
  exports[1140] = "ER_MIX_OF_GROUP_FUNC_AND_FIELDS";
  exports[1141] = "ER_NONEXISTING_GRANT";
  exports[1142] = "ER_TABLEACCESS_DENIED_ERROR";
  exports[1143] = "ER_COLUMNACCESS_DENIED_ERROR";
  exports[1144] = "ER_ILLEGAL_GRANT_FOR_TABLE";
  exports[1145] = "ER_GRANT_WRONG_HOST_OR_USER";
  exports[1146] = "ER_NO_SUCH_TABLE";
  exports[1147] = "ER_NONEXISTING_TABLE_GRANT";
  exports[1148] = "ER_NOT_ALLOWED_COMMAND";
  exports[1149] = "ER_SYNTAX_ERROR";
  exports[1150] = "ER_UNUSED1";
  exports[1151] = "ER_UNUSED2";
  exports[1152] = "ER_ABORTING_CONNECTION";
  exports[1153] = "ER_NET_PACKET_TOO_LARGE";
  exports[1154] = "ER_NET_READ_ERROR_FROM_PIPE";
  exports[1155] = "ER_NET_FCNTL_ERROR";
  exports[1156] = "ER_NET_PACKETS_OUT_OF_ORDER";
  exports[1157] = "ER_NET_UNCOMPRESS_ERROR";
  exports[1158] = "ER_NET_READ_ERROR";
  exports[1159] = "ER_NET_READ_INTERRUPTED";
  exports[1160] = "ER_NET_ERROR_ON_WRITE";
  exports[1161] = "ER_NET_WRITE_INTERRUPTED";
  exports[1162] = "ER_TOO_LONG_STRING";
  exports[1163] = "ER_TABLE_CANT_HANDLE_BLOB";
  exports[1164] = "ER_TABLE_CANT_HANDLE_AUTO_INCREMENT";
  exports[1165] = "ER_UNUSED3";
  exports[1166] = "ER_WRONG_COLUMN_NAME";
  exports[1167] = "ER_WRONG_KEY_COLUMN";
  exports[1168] = "ER_WRONG_MRG_TABLE";
  exports[1169] = "ER_DUP_UNIQUE";
  exports[1170] = "ER_BLOB_KEY_WITHOUT_LENGTH";
  exports[1171] = "ER_PRIMARY_CANT_HAVE_NULL";
  exports[1172] = "ER_TOO_MANY_ROWS";
  exports[1173] = "ER_REQUIRES_PRIMARY_KEY";
  exports[1174] = "ER_NO_RAID_COMPILED";
  exports[1175] = "ER_UPDATE_WITHOUT_KEY_IN_SAFE_MODE";
  exports[1176] = "ER_KEY_DOES_NOT_EXITS";
  exports[1177] = "ER_CHECK_NO_SUCH_TABLE";
  exports[1178] = "ER_CHECK_NOT_IMPLEMENTED";
  exports[1179] = "ER_CANT_DO_THIS_DURING_AN_TRANSACTION";
  exports[1180] = "ER_ERROR_DURING_COMMIT";
  exports[1181] = "ER_ERROR_DURING_ROLLBACK";
  exports[1182] = "ER_ERROR_DURING_FLUSH_LOGS";
  exports[1183] = "ER_ERROR_DURING_CHECKPOINT";
  exports[1184] = "ER_NEW_ABORTING_CONNECTION";
  exports[1185] = "ER_DUMP_NOT_IMPLEMENTED";
  exports[1186] = "ER_FLUSH_MASTER_BINLOG_CLOSED";
  exports[1187] = "ER_INDEX_REBUILD";
  exports[1188] = "ER_SOURCE";
  exports[1189] = "ER_SOURCE_NET_READ";
  exports[1190] = "ER_SOURCE_NET_WRITE";
  exports[1191] = "ER_FT_MATCHING_KEY_NOT_FOUND";
  exports[1192] = "ER_LOCK_OR_ACTIVE_TRANSACTION";
  exports[1193] = "ER_UNKNOWN_SYSTEM_VARIABLE";
  exports[1194] = "ER_CRASHED_ON_USAGE";
  exports[1195] = "ER_CRASHED_ON_REPAIR";
  exports[1196] = "ER_WARNING_NOT_COMPLETE_ROLLBACK";
  exports[1197] = "ER_TRANS_CACHE_FULL";
  exports[1198] = "ER_SLAVE_MUST_STOP";
  exports[1199] = "ER_REPLICA_NOT_RUNNING";
  exports[1200] = "ER_BAD_REPLICA";
  exports[1201] = "ER_CONNECTION_METADATA";
  exports[1202] = "ER_REPLICA_THREAD";
  exports[1203] = "ER_TOO_MANY_USER_CONNECTIONS";
  exports[1204] = "ER_SET_CONSTANTS_ONLY";
  exports[1205] = "ER_LOCK_WAIT_TIMEOUT";
  exports[1206] = "ER_LOCK_TABLE_FULL";
  exports[1207] = "ER_READ_ONLY_TRANSACTION";
  exports[1208] = "ER_DROP_DB_WITH_READ_LOCK";
  exports[1209] = "ER_CREATE_DB_WITH_READ_LOCK";
  exports[1210] = "ER_WRONG_ARGUMENTS";
  exports[1211] = "ER_NO_PERMISSION_TO_CREATE_USER";
  exports[1212] = "ER_UNION_TABLES_IN_DIFFERENT_DIR";
  exports[1213] = "ER_LOCK_DEADLOCK";
  exports[1214] = "ER_TABLE_CANT_HANDLE_FT";
  exports[1215] = "ER_CANNOT_ADD_FOREIGN";
  exports[1216] = "ER_NO_REFERENCED_ROW";
  exports[1217] = "ER_ROW_IS_REFERENCED";
  exports[1218] = "ER_CONNECT_TO_SOURCE";
  exports[1219] = "ER_QUERY_ON_MASTER";
  exports[1220] = "ER_ERROR_WHEN_EXECUTING_COMMAND";
  exports[1221] = "ER_WRONG_USAGE";
  exports[1222] = "ER_WRONG_NUMBER_OF_COLUMNS_IN_SELECT";
  exports[1223] = "ER_CANT_UPDATE_WITH_READLOCK";
  exports[1224] = "ER_MIXING_NOT_ALLOWED";
  exports[1225] = "ER_DUP_ARGUMENT";
  exports[1226] = "ER_USER_LIMIT_REACHED";
  exports[1227] = "ER_SPECIFIC_ACCESS_DENIED_ERROR";
  exports[1228] = "ER_LOCAL_VARIABLE";
  exports[1229] = "ER_GLOBAL_VARIABLE";
  exports[1230] = "ER_NO_DEFAULT";
  exports[1231] = "ER_WRONG_VALUE_FOR_VAR";
  exports[1232] = "ER_WRONG_TYPE_FOR_VAR";
  exports[1233] = "ER_VAR_CANT_BE_READ";
  exports[1234] = "ER_CANT_USE_OPTION_HERE";
  exports[1235] = "ER_NOT_SUPPORTED_YET";
  exports[1236] = "ER_SOURCE_FATAL_ERROR_READING_BINLOG";
  exports[1237] = "ER_REPLICA_IGNORED_TABLE";
  exports[1238] = "ER_INCORRECT_GLOBAL_LOCAL_VAR";
  exports[1239] = "ER_WRONG_FK_DEF";
  exports[1240] = "ER_KEY_REF_DO_NOT_MATCH_TABLE_REF";
  exports[1241] = "ER_OPERAND_COLUMNS";
  exports[1242] = "ER_SUBQUERY_NO_1_ROW";
  exports[1243] = "ER_UNKNOWN_STMT_HANDLER";
  exports[1244] = "ER_CORRUPT_HELP_DB";
  exports[1245] = "ER_CYCLIC_REFERENCE";
  exports[1246] = "ER_AUTO_CONVERT";
  exports[1247] = "ER_ILLEGAL_REFERENCE";
  exports[1248] = "ER_DERIVED_MUST_HAVE_ALIAS";
  exports[1249] = "ER_SELECT_REDUCED";
  exports[1250] = "ER_TABLENAME_NOT_ALLOWED_HERE";
  exports[1251] = "ER_NOT_SUPPORTED_AUTH_MODE";
  exports[1252] = "ER_SPATIAL_CANT_HAVE_NULL";
  exports[1253] = "ER_COLLATION_CHARSET_MISMATCH";
  exports[1254] = "ER_SLAVE_WAS_RUNNING";
  exports[1255] = "ER_SLAVE_WAS_NOT_RUNNING";
  exports[1256] = "ER_TOO_BIG_FOR_UNCOMPRESS";
  exports[1257] = "ER_ZLIB_Z_MEM_ERROR";
  exports[1258] = "ER_ZLIB_Z_BUF_ERROR";
  exports[1259] = "ER_ZLIB_Z_DATA_ERROR";
  exports[1260] = "ER_CUT_VALUE_GROUP_CONCAT";
  exports[1261] = "ER_WARN_TOO_FEW_RECORDS";
  exports[1262] = "ER_WARN_TOO_MANY_RECORDS";
  exports[1263] = "ER_WARN_NULL_TO_NOTNULL";
  exports[1264] = "ER_WARN_DATA_OUT_OF_RANGE";
  exports[1265] = "WARN_DATA_TRUNCATED";
  exports[1266] = "ER_WARN_USING_OTHER_HANDLER";
  exports[1267] = "ER_CANT_AGGREGATE_2COLLATIONS";
  exports[1268] = "ER_DROP_USER";
  exports[1269] = "ER_REVOKE_GRANTS";
  exports[1270] = "ER_CANT_AGGREGATE_3COLLATIONS";
  exports[1271] = "ER_CANT_AGGREGATE_NCOLLATIONS";
  exports[1272] = "ER_VARIABLE_IS_NOT_STRUCT";
  exports[1273] = "ER_UNKNOWN_COLLATION";
  exports[1274] = "ER_REPLICA_IGNORED_SSL_PARAMS";
  exports[1275] = "ER_SERVER_IS_IN_SECURE_AUTH_MODE";
  exports[1276] = "ER_WARN_FIELD_RESOLVED";
  exports[1277] = "ER_BAD_REPLICA_UNTIL_COND";
  exports[1278] = "ER_MISSING_SKIP_REPLICA";
  exports[1279] = "ER_UNTIL_COND_IGNORED";
  exports[1280] = "ER_WRONG_NAME_FOR_INDEX";
  exports[1281] = "ER_WRONG_NAME_FOR_CATALOG";
  exports[1282] = "ER_WARN_QC_RESIZE";
  exports[1283] = "ER_BAD_FT_COLUMN";
  exports[1284] = "ER_UNKNOWN_KEY_CACHE";
  exports[1285] = "ER_WARN_HOSTNAME_WONT_WORK";
  exports[1286] = "ER_UNKNOWN_STORAGE_ENGINE";
  exports[1287] = "ER_WARN_DEPRECATED_SYNTAX";
  exports[1288] = "ER_NON_UPDATABLE_TABLE";
  exports[1289] = "ER_FEATURE_DISABLED";
  exports[1290] = "ER_OPTION_PREVENTS_STATEMENT";
  exports[1291] = "ER_DUPLICATED_VALUE_IN_TYPE";
  exports[1292] = "ER_TRUNCATED_WRONG_VALUE";
  exports[1293] = "ER_TOO_MUCH_AUTO_TIMESTAMP_COLS";
  exports[1294] = "ER_INVALID_ON_UPDATE";
  exports[1295] = "ER_UNSUPPORTED_PS";
  exports[1296] = "ER_GET_ERRMSG";
  exports[1297] = "ER_GET_TEMPORARY_ERRMSG";
  exports[1298] = "ER_UNKNOWN_TIME_ZONE";
  exports[1299] = "ER_WARN_INVALID_TIMESTAMP";
  exports[1300] = "ER_INVALID_CHARACTER_STRING";
  exports[1301] = "ER_WARN_ALLOWED_PACKET_OVERFLOWED";
  exports[1302] = "ER_CONFLICTING_DECLARATIONS";
  exports[1303] = "ER_SP_NO_RECURSIVE_CREATE";
  exports[1304] = "ER_SP_ALREADY_EXISTS";
  exports[1305] = "ER_SP_DOES_NOT_EXIST";
  exports[1306] = "ER_SP_DROP_FAILED";
  exports[1307] = "ER_SP_STORE_FAILED";
  exports[1308] = "ER_SP_LILABEL_MISMATCH";
  exports[1309] = "ER_SP_LABEL_REDEFINE";
  exports[1310] = "ER_SP_LABEL_MISMATCH";
  exports[1311] = "ER_SP_UNINIT_VAR";
  exports[1312] = "ER_SP_BADSELECT";
  exports[1313] = "ER_SP_BADRETURN";
  exports[1314] = "ER_SP_BADSTATEMENT";
  exports[1315] = "ER_UPDATE_LOG_DEPRECATED_IGNORED";
  exports[1316] = "ER_UPDATE_LOG_DEPRECATED_TRANSLATED";
  exports[1317] = "ER_QUERY_INTERRUPTED";
  exports[1318] = "ER_SP_WRONG_NO_OF_ARGS";
  exports[1319] = "ER_SP_COND_MISMATCH";
  exports[1320] = "ER_SP_NORETURN";
  exports[1321] = "ER_SP_NORETURNEND";
  exports[1322] = "ER_SP_BAD_CURSOR_QUERY";
  exports[1323] = "ER_SP_BAD_CURSOR_SELECT";
  exports[1324] = "ER_SP_CURSOR_MISMATCH";
  exports[1325] = "ER_SP_CURSOR_ALREADY_OPEN";
  exports[1326] = "ER_SP_CURSOR_NOT_OPEN";
  exports[1327] = "ER_SP_UNDECLARED_VAR";
  exports[1328] = "ER_SP_WRONG_NO_OF_FETCH_ARGS";
  exports[1329] = "ER_SP_FETCH_NO_DATA";
  exports[1330] = "ER_SP_DUP_PARAM";
  exports[1331] = "ER_SP_DUP_VAR";
  exports[1332] = "ER_SP_DUP_COND";
  exports[1333] = "ER_SP_DUP_CURS";
  exports[1334] = "ER_SP_CANT_ALTER";
  exports[1335] = "ER_SP_SUBSELECT_NYI";
  exports[1336] = "ER_STMT_NOT_ALLOWED_IN_SF_OR_TRG";
  exports[1337] = "ER_SP_VARCOND_AFTER_CURSHNDLR";
  exports[1338] = "ER_SP_CURSOR_AFTER_HANDLER";
  exports[1339] = "ER_SP_CASE_NOT_FOUND";
  exports[1340] = "ER_FPARSER_TOO_BIG_FILE";
  exports[1341] = "ER_FPARSER_BAD_HEADER";
  exports[1342] = "ER_FPARSER_EOF_IN_COMMENT";
  exports[1343] = "ER_FPARSER_ERROR_IN_PARAMETER";
  exports[1344] = "ER_FPARSER_EOF_IN_UNKNOWN_PARAMETER";
  exports[1345] = "ER_VIEW_NO_EXPLAIN";
  exports[1346] = "ER_FRM_UNKNOWN_TYPE";
  exports[1347] = "ER_WRONG_OBJECT";
  exports[1348] = "ER_NONUPDATEABLE_COLUMN";
  exports[1349] = "ER_VIEW_SELECT_DERIVED";
  exports[1350] = "ER_VIEW_SELECT_CLAUSE";
  exports[1351] = "ER_VIEW_SELECT_VARIABLE";
  exports[1352] = "ER_VIEW_SELECT_TMPTABLE";
  exports[1353] = "ER_VIEW_WRONG_LIST";
  exports[1354] = "ER_WARN_VIEW_MERGE";
  exports[1355] = "ER_WARN_VIEW_WITHOUT_KEY";
  exports[1356] = "ER_VIEW_INVALID";
  exports[1357] = "ER_SP_NO_DROP_SP";
  exports[1358] = "ER_SP_GOTO_IN_HNDLR";
  exports[1359] = "ER_TRG_ALREADY_EXISTS";
  exports[1360] = "ER_TRG_DOES_NOT_EXIST";
  exports[1361] = "ER_TRG_ON_VIEW_OR_TEMP_TABLE";
  exports[1362] = "ER_TRG_CANT_CHANGE_ROW";
  exports[1363] = "ER_TRG_NO_SUCH_ROW_IN_TRG";
  exports[1364] = "ER_NO_DEFAULT_FOR_FIELD";
  exports[1365] = "ER_DIVISION_BY_ZERO";
  exports[1366] = "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD";
  exports[1367] = "ER_ILLEGAL_VALUE_FOR_TYPE";
  exports[1368] = "ER_VIEW_NONUPD_CHECK";
  exports[1369] = "ER_VIEW_CHECK_FAILED";
  exports[1370] = "ER_PROCACCESS_DENIED_ERROR";
  exports[1371] = "ER_RELAY_LOG_FAIL";
  exports[1372] = "ER_PASSWD_LENGTH";
  exports[1373] = "ER_UNKNOWN_TARGET_BINLOG";
  exports[1374] = "ER_IO_ERR_LOG_INDEX_READ";
  exports[1375] = "ER_BINLOG_PURGE_PROHIBITED";
  exports[1376] = "ER_FSEEK_FAIL";
  exports[1377] = "ER_BINLOG_PURGE_FATAL_ERR";
  exports[1378] = "ER_LOG_IN_USE";
  exports[1379] = "ER_LOG_PURGE_UNKNOWN_ERR";
  exports[1380] = "ER_RELAY_LOG_INIT";
  exports[1381] = "ER_NO_BINARY_LOGGING";
  exports[1382] = "ER_RESERVED_SYNTAX";
  exports[1383] = "ER_WSAS_FAILED";
  exports[1384] = "ER_DIFF_GROUPS_PROC";
  exports[1385] = "ER_NO_GROUP_FOR_PROC";
  exports[1386] = "ER_ORDER_WITH_PROC";
  exports[1387] = "ER_LOGGING_PROHIBIT_CHANGING_OF";
  exports[1388] = "ER_NO_FILE_MAPPING";
  exports[1389] = "ER_WRONG_MAGIC";
  exports[1390] = "ER_PS_MANY_PARAM";
  exports[1391] = "ER_KEY_PART_0";
  exports[1392] = "ER_VIEW_CHECKSUM";
  exports[1393] = "ER_VIEW_MULTIUPDATE";
  exports[1394] = "ER_VIEW_NO_INSERT_FIELD_LIST";
  exports[1395] = "ER_VIEW_DELETE_MERGE_VIEW";
  exports[1396] = "ER_CANNOT_USER";
  exports[1397] = "ER_XAER_NOTA";
  exports[1398] = "ER_XAER_INVAL";
  exports[1399] = "ER_XAER_RMFAIL";
  exports[1400] = "ER_XAER_OUTSIDE";
  exports[1401] = "ER_XAER_RMERR";
  exports[1402] = "ER_XA_RBROLLBACK";
  exports[1403] = "ER_NONEXISTING_PROC_GRANT";
  exports[1404] = "ER_PROC_AUTO_GRANT_FAIL";
  exports[1405] = "ER_PROC_AUTO_REVOKE_FAIL";
  exports[1406] = "ER_DATA_TOO_LONG";
  exports[1407] = "ER_SP_BAD_SQLSTATE";
  exports[1408] = "ER_STARTUP";
  exports[1409] = "ER_LOAD_FROM_FIXED_SIZE_ROWS_TO_VAR";
  exports[1410] = "ER_CANT_CREATE_USER_WITH_GRANT";
  exports[1411] = "ER_WRONG_VALUE_FOR_TYPE";
  exports[1412] = "ER_TABLE_DEF_CHANGED";
  exports[1413] = "ER_SP_DUP_HANDLER";
  exports[1414] = "ER_SP_NOT_VAR_ARG";
  exports[1415] = "ER_SP_NO_RETSET";
  exports[1416] = "ER_CANT_CREATE_GEOMETRY_OBJECT";
  exports[1417] = "ER_FAILED_ROUTINE_BREAK_BINLOG";
  exports[1418] = "ER_BINLOG_UNSAFE_ROUTINE";
  exports[1419] = "ER_BINLOG_CREATE_ROUTINE_NEED_SUPER";
  exports[1420] = "ER_EXEC_STMT_WITH_OPEN_CURSOR";
  exports[1421] = "ER_STMT_HAS_NO_OPEN_CURSOR";
  exports[1422] = "ER_COMMIT_NOT_ALLOWED_IN_SF_OR_TRG";
  exports[1423] = "ER_NO_DEFAULT_FOR_VIEW_FIELD";
  exports[1424] = "ER_SP_NO_RECURSION";
  exports[1425] = "ER_TOO_BIG_SCALE";
  exports[1426] = "ER_TOO_BIG_PRECISION";
  exports[1427] = "ER_M_BIGGER_THAN_D";
  exports[1428] = "ER_WRONG_LOCK_OF_SYSTEM_TABLE";
  exports[1429] = "ER_CONNECT_TO_FOREIGN_DATA_SOURCE";
  exports[1430] = "ER_QUERY_ON_FOREIGN_DATA_SOURCE";
  exports[1431] = "ER_FOREIGN_DATA_SOURCE_DOESNT_EXIST";
  exports[1432] = "ER_FOREIGN_DATA_STRING_INVALID_CANT_CREATE";
  exports[1433] = "ER_FOREIGN_DATA_STRING_INVALID";
  exports[1434] = "ER_CANT_CREATE_FEDERATED_TABLE";
  exports[1435] = "ER_TRG_IN_WRONG_SCHEMA";
  exports[1436] = "ER_STACK_OVERRUN_NEED_MORE";
  exports[1437] = "ER_TOO_LONG_BODY";
  exports[1438] = "ER_WARN_CANT_DROP_DEFAULT_KEYCACHE";
  exports[1439] = "ER_TOO_BIG_DISPLAYWIDTH";
  exports[1440] = "ER_XAER_DUPID";
  exports[1441] = "ER_DATETIME_FUNCTION_OVERFLOW";
  exports[1442] = "ER_CANT_UPDATE_USED_TABLE_IN_SF_OR_TRG";
  exports[1443] = "ER_VIEW_PREVENT_UPDATE";
  exports[1444] = "ER_PS_NO_RECURSION";
  exports[1445] = "ER_SP_CANT_SET_AUTOCOMMIT";
  exports[1446] = "ER_MALFORMED_DEFINER";
  exports[1447] = "ER_VIEW_FRM_NO_USER";
  exports[1448] = "ER_VIEW_OTHER_USER";
  exports[1449] = "ER_NO_SUCH_USER";
  exports[1450] = "ER_FORBID_SCHEMA_CHANGE";
  exports[1451] = "ER_ROW_IS_REFERENCED_2";
  exports[1452] = "ER_NO_REFERENCED_ROW_2";
  exports[1453] = "ER_SP_BAD_VAR_SHADOW";
  exports[1454] = "ER_TRG_NO_DEFINER";
  exports[1455] = "ER_OLD_FILE_FORMAT";
  exports[1456] = "ER_SP_RECURSION_LIMIT";
  exports[1457] = "ER_SP_PROC_TABLE_CORRUPT";
  exports[1458] = "ER_SP_WRONG_NAME";
  exports[1459] = "ER_TABLE_NEEDS_UPGRADE";
  exports[1460] = "ER_SP_NO_AGGREGATE";
  exports[1461] = "ER_MAX_PREPARED_STMT_COUNT_REACHED";
  exports[1462] = "ER_VIEW_RECURSIVE";
  exports[1463] = "ER_NON_GROUPING_FIELD_USED";
  exports[1464] = "ER_TABLE_CANT_HANDLE_SPKEYS";
  exports[1465] = "ER_NO_TRIGGERS_ON_SYSTEM_SCHEMA";
  exports[1466] = "ER_REMOVED_SPACES";
  exports[1467] = "ER_AUTOINC_READ_FAILED";
  exports[1468] = "ER_USERNAME";
  exports[1469] = "ER_HOSTNAME";
  exports[1470] = "ER_WRONG_STRING_LENGTH";
  exports[1471] = "ER_NON_INSERTABLE_TABLE";
  exports[1472] = "ER_ADMIN_WRONG_MRG_TABLE";
  exports[1473] = "ER_TOO_HIGH_LEVEL_OF_NESTING_FOR_SELECT";
  exports[1474] = "ER_NAME_BECOMES_EMPTY";
  exports[1475] = "ER_AMBIGUOUS_FIELD_TERM";
  exports[1476] = "ER_FOREIGN_SERVER_EXISTS";
  exports[1477] = "ER_FOREIGN_SERVER_DOESNT_EXIST";
  exports[1478] = "ER_ILLEGAL_HA_CREATE_OPTION";
  exports[1479] = "ER_PARTITION_REQUIRES_VALUES_ERROR";
  exports[1480] = "ER_PARTITION_WRONG_VALUES_ERROR";
  exports[1481] = "ER_PARTITION_MAXVALUE_ERROR";
  exports[1482] = "ER_PARTITION_SUBPARTITION_ERROR";
  exports[1483] = "ER_PARTITION_SUBPART_MIX_ERROR";
  exports[1484] = "ER_PARTITION_WRONG_NO_PART_ERROR";
  exports[1485] = "ER_PARTITION_WRONG_NO_SUBPART_ERROR";
  exports[1486] = "ER_WRONG_EXPR_IN_PARTITION_FUNC_ERROR";
  exports[1487] = "ER_NO_CONST_EXPR_IN_RANGE_OR_LIST_ERROR";
  exports[1488] = "ER_FIELD_NOT_FOUND_PART_ERROR";
  exports[1489] = "ER_LIST_OF_FIELDS_ONLY_IN_HASH_ERROR";
  exports[1490] = "ER_INCONSISTENT_PARTITION_INFO_ERROR";
  exports[1491] = "ER_PARTITION_FUNC_NOT_ALLOWED_ERROR";
  exports[1492] = "ER_PARTITIONS_MUST_BE_DEFINED_ERROR";
  exports[1493] = "ER_RANGE_NOT_INCREASING_ERROR";
  exports[1494] = "ER_INCONSISTENT_TYPE_OF_FUNCTIONS_ERROR";
  exports[1495] = "ER_MULTIPLE_DEF_CONST_IN_LIST_PART_ERROR";
  exports[1496] = "ER_PARTITION_ENTRY_ERROR";
  exports[1497] = "ER_MIX_HANDLER_ERROR";
  exports[1498] = "ER_PARTITION_NOT_DEFINED_ERROR";
  exports[1499] = "ER_TOO_MANY_PARTITIONS_ERROR";
  exports[1500] = "ER_SUBPARTITION_ERROR";
  exports[1501] = "ER_CANT_CREATE_HANDLER_FILE";
  exports[1502] = "ER_BLOB_FIELD_IN_PART_FUNC_ERROR";
  exports[1503] = "ER_UNIQUE_KEY_NEED_ALL_FIELDS_IN_PF";
  exports[1504] = "ER_NO_PARTS_ERROR";
  exports[1505] = "ER_PARTITION_MGMT_ON_NONPARTITIONED";
  exports[1506] = "ER_FOREIGN_KEY_ON_PARTITIONED";
  exports[1507] = "ER_DROP_PARTITION_NON_EXISTENT";
  exports[1508] = "ER_DROP_LAST_PARTITION";
  exports[1509] = "ER_COALESCE_ONLY_ON_HASH_PARTITION";
  exports[1510] = "ER_REORG_HASH_ONLY_ON_SAME_NO";
  exports[1511] = "ER_REORG_NO_PARAM_ERROR";
  exports[1512] = "ER_ONLY_ON_RANGE_LIST_PARTITION";
  exports[1513] = "ER_ADD_PARTITION_SUBPART_ERROR";
  exports[1514] = "ER_ADD_PARTITION_NO_NEW_PARTITION";
  exports[1515] = "ER_COALESCE_PARTITION_NO_PARTITION";
  exports[1516] = "ER_REORG_PARTITION_NOT_EXIST";
  exports[1517] = "ER_SAME_NAME_PARTITION";
  exports[1518] = "ER_NO_BINLOG_ERROR";
  exports[1519] = "ER_CONSECUTIVE_REORG_PARTITIONS";
  exports[1520] = "ER_REORG_OUTSIDE_RANGE";
  exports[1521] = "ER_PARTITION_FUNCTION_FAILURE";
  exports[1522] = "ER_PART_STATE_ERROR";
  exports[1523] = "ER_LIMITED_PART_RANGE";
  exports[1524] = "ER_PLUGIN_IS_NOT_LOADED";
  exports[1525] = "ER_WRONG_VALUE";
  exports[1526] = "ER_NO_PARTITION_FOR_GIVEN_VALUE";
  exports[1527] = "ER_FILEGROUP_OPTION_ONLY_ONCE";
  exports[1528] = "ER_CREATE_FILEGROUP_FAILED";
  exports[1529] = "ER_DROP_FILEGROUP_FAILED";
  exports[1530] = "ER_TABLESPACE_AUTO_EXTEND_ERROR";
  exports[1531] = "ER_WRONG_SIZE_NUMBER";
  exports[1532] = "ER_SIZE_OVERFLOW_ERROR";
  exports[1533] = "ER_ALTER_FILEGROUP_FAILED";
  exports[1534] = "ER_BINLOG_ROW_LOGGING_FAILED";
  exports[1535] = "ER_BINLOG_ROW_WRONG_TABLE_DEF";
  exports[1536] = "ER_BINLOG_ROW_RBR_TO_SBR";
  exports[1537] = "ER_EVENT_ALREADY_EXISTS";
  exports[1538] = "ER_EVENT_STORE_FAILED";
  exports[1539] = "ER_EVENT_DOES_NOT_EXIST";
  exports[1540] = "ER_EVENT_CANT_ALTER";
  exports[1541] = "ER_EVENT_DROP_FAILED";
  exports[1542] = "ER_EVENT_INTERVAL_NOT_POSITIVE_OR_TOO_BIG";
  exports[1543] = "ER_EVENT_ENDS_BEFORE_STARTS";
  exports[1544] = "ER_EVENT_EXEC_TIME_IN_THE_PAST";
  exports[1545] = "ER_EVENT_OPEN_TABLE_FAILED";
  exports[1546] = "ER_EVENT_NEITHER_M_EXPR_NOR_M_AT";
  exports[1547] = "ER_COL_COUNT_DOESNT_MATCH_CORRUPTED";
  exports[1548] = "ER_CANNOT_LOAD_FROM_TABLE";
  exports[1549] = "ER_EVENT_CANNOT_DELETE";
  exports[1550] = "ER_EVENT_COMPILE_ERROR";
  exports[1551] = "ER_EVENT_SAME_NAME";
  exports[1552] = "ER_EVENT_DATA_TOO_LONG";
  exports[1553] = "ER_DROP_INDEX_FK";
  exports[1554] = "ER_WARN_DEPRECATED_SYNTAX_WITH_VER";
  exports[1555] = "ER_CANT_WRITE_LOCK_LOG_TABLE";
  exports[1556] = "ER_CANT_LOCK_LOG_TABLE";
  exports[1557] = "ER_FOREIGN_DUPLICATE_KEY";
  exports[1558] = "ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE";
  exports[1559] = "ER_TEMP_TABLE_PREVENTS_SWITCH_OUT_OF_RBR";
  exports[1560] = "ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_FORMAT";
  exports[1561] = "ER_NDB_CANT_SWITCH_BINLOG_FORMAT";
  exports[1562] = "ER_PARTITION_NO_TEMPORARY";
  exports[1563] = "ER_PARTITION_CONST_DOMAIN_ERROR";
  exports[1564] = "ER_PARTITION_FUNCTION_IS_NOT_ALLOWED";
  exports[1565] = "ER_DDL_LOG_ERROR";
  exports[1566] = "ER_NULL_IN_VALUES_LESS_THAN";
  exports[1567] = "ER_WRONG_PARTITION_NAME";
  exports[1568] = "ER_CANT_CHANGE_TX_CHARACTERISTICS";
  exports[1569] = "ER_DUP_ENTRY_AUTOINCREMENT_CASE";
  exports[1570] = "ER_EVENT_MODIFY_QUEUE_ERROR";
  exports[1571] = "ER_EVENT_SET_VAR_ERROR";
  exports[1572] = "ER_PARTITION_MERGE_ERROR";
  exports[1573] = "ER_CANT_ACTIVATE_LOG";
  exports[1574] = "ER_RBR_NOT_AVAILABLE";
  exports[1575] = "ER_BASE64_DECODE_ERROR";
  exports[1576] = "ER_EVENT_RECURSION_FORBIDDEN";
  exports[1577] = "ER_EVENTS_DB_ERROR";
  exports[1578] = "ER_ONLY_INTEGERS_ALLOWED";
  exports[1579] = "ER_UNSUPORTED_LOG_ENGINE";
  exports[1580] = "ER_BAD_LOG_STATEMENT";
  exports[1581] = "ER_CANT_RENAME_LOG_TABLE";
  exports[1582] = "ER_WRONG_PARAMCOUNT_TO_NATIVE_FCT";
  exports[1583] = "ER_WRONG_PARAMETERS_TO_NATIVE_FCT";
  exports[1584] = "ER_WRONG_PARAMETERS_TO_STORED_FCT";
  exports[1585] = "ER_NATIVE_FCT_NAME_COLLISION";
  exports[1586] = "ER_DUP_ENTRY_WITH_KEY_NAME";
  exports[1587] = "ER_BINLOG_PURGE_EMFILE";
  exports[1588] = "ER_EVENT_CANNOT_CREATE_IN_THE_PAST";
  exports[1589] = "ER_EVENT_CANNOT_ALTER_IN_THE_PAST";
  exports[1590] = "ER_SLAVE_INCIDENT";
  exports[1591] = "ER_NO_PARTITION_FOR_GIVEN_VALUE_SILENT";
  exports[1592] = "ER_BINLOG_UNSAFE_STATEMENT";
  exports[1593] = "ER_BINLOG_FATAL_ERROR";
  exports[1594] = "ER_SLAVE_RELAY_LOG_READ_FAILURE";
  exports[1595] = "ER_SLAVE_RELAY_LOG_WRITE_FAILURE";
  exports[1596] = "ER_SLAVE_CREATE_EVENT_FAILURE";
  exports[1597] = "ER_SLAVE_MASTER_COM_FAILURE";
  exports[1598] = "ER_BINLOG_LOGGING_IMPOSSIBLE";
  exports[1599] = "ER_VIEW_NO_CREATION_CTX";
  exports[1600] = "ER_VIEW_INVALID_CREATION_CTX";
  exports[1601] = "ER_SR_INVALID_CREATION_CTX";
  exports[1602] = "ER_TRG_CORRUPTED_FILE";
  exports[1603] = "ER_TRG_NO_CREATION_CTX";
  exports[1604] = "ER_TRG_INVALID_CREATION_CTX";
  exports[1605] = "ER_EVENT_INVALID_CREATION_CTX";
  exports[1606] = "ER_TRG_CANT_OPEN_TABLE";
  exports[1607] = "ER_CANT_CREATE_SROUTINE";
  exports[1608] = "ER_NEVER_USED";
  exports[1609] = "ER_NO_FORMAT_DESCRIPTION_EVENT_BEFORE_BINLOG_STATEMENT";
  exports[1610] = "ER_REPLICA_CORRUPT_EVENT";
  exports[1611] = "ER_LOAD_DATA_INVALID_COLUMN";
  exports[1612] = "ER_LOG_PURGE_NO_FILE";
  exports[1613] = "ER_XA_RBTIMEOUT";
  exports[1614] = "ER_XA_RBDEADLOCK";
  exports[1615] = "ER_NEED_REPREPARE";
  exports[1616] = "ER_DELAYED_NOT_SUPPORTED";
  exports[1617] = "WARN_NO_CONNECTION_METADATA";
  exports[1618] = "WARN_OPTION_IGNORED";
  exports[1619] = "ER_PLUGIN_DELETE_BUILTIN";
  exports[1620] = "WARN_PLUGIN_BUSY";
  exports[1621] = "ER_VARIABLE_IS_READONLY";
  exports[1622] = "ER_WARN_ENGINE_TRANSACTION_ROLLBACK";
  exports[1623] = "ER_SLAVE_HEARTBEAT_FAILURE";
  exports[1624] = "ER_REPLICA_HEARTBEAT_VALUE_OUT_OF_RANGE";
  exports[1625] = "ER_NDB_REPLICATION_SCHEMA_ERROR";
  exports[1626] = "ER_CONFLICT_FN_PARSE_ERROR";
  exports[1627] = "ER_EXCEPTIONS_WRITE_ERROR";
  exports[1628] = "ER_TOO_LONG_TABLE_COMMENT";
  exports[1629] = "ER_TOO_LONG_FIELD_COMMENT";
  exports[1630] = "ER_FUNC_INEXISTENT_NAME_COLLISION";
  exports[1631] = "ER_DATABASE_NAME";
  exports[1632] = "ER_TABLE_NAME";
  exports[1633] = "ER_PARTITION_NAME";
  exports[1634] = "ER_SUBPARTITION_NAME";
  exports[1635] = "ER_TEMPORARY_NAME";
  exports[1636] = "ER_RENAMED_NAME";
  exports[1637] = "ER_TOO_MANY_CONCURRENT_TRXS";
  exports[1638] = "WARN_NON_ASCII_SEPARATOR_NOT_IMPLEMENTED";
  exports[1639] = "ER_DEBUG_SYNC_TIMEOUT";
  exports[1640] = "ER_DEBUG_SYNC_HIT_LIMIT";
  exports[1641] = "ER_DUP_SIGNAL_SET";
  exports[1642] = "ER_SIGNAL_WARN";
  exports[1643] = "ER_SIGNAL_NOT_FOUND";
  exports[1644] = "ER_SIGNAL_EXCEPTION";
  exports[1645] = "ER_RESIGNAL_WITHOUT_ACTIVE_HANDLER";
  exports[1646] = "ER_SIGNAL_BAD_CONDITION_TYPE";
  exports[1647] = "WARN_COND_ITEM_TRUNCATED";
  exports[1648] = "ER_COND_ITEM_TOO_LONG";
  exports[1649] = "ER_UNKNOWN_LOCALE";
  exports[1650] = "ER_REPLICA_IGNORE_SERVER_IDS";
  exports[1651] = "ER_QUERY_CACHE_DISABLED";
  exports[1652] = "ER_SAME_NAME_PARTITION_FIELD";
  exports[1653] = "ER_PARTITION_COLUMN_LIST_ERROR";
  exports[1654] = "ER_WRONG_TYPE_COLUMN_VALUE_ERROR";
  exports[1655] = "ER_TOO_MANY_PARTITION_FUNC_FIELDS_ERROR";
  exports[1656] = "ER_MAXVALUE_IN_VALUES_IN";
  exports[1657] = "ER_TOO_MANY_VALUES_ERROR";
  exports[1658] = "ER_ROW_SINGLE_PARTITION_FIELD_ERROR";
  exports[1659] = "ER_FIELD_TYPE_NOT_ALLOWED_AS_PARTITION_FIELD";
  exports[1660] = "ER_PARTITION_FIELDS_TOO_LONG";
  exports[1661] = "ER_BINLOG_ROW_ENGINE_AND_STMT_ENGINE";
  exports[1662] = "ER_BINLOG_ROW_MODE_AND_STMT_ENGINE";
  exports[1663] = "ER_BINLOG_UNSAFE_AND_STMT_ENGINE";
  exports[1664] = "ER_BINLOG_ROW_INJECTION_AND_STMT_ENGINE";
  exports[1665] = "ER_BINLOG_STMT_MODE_AND_ROW_ENGINE";
  exports[1666] = "ER_BINLOG_ROW_INJECTION_AND_STMT_MODE";
  exports[1667] = "ER_BINLOG_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE";
  exports[1668] = "ER_BINLOG_UNSAFE_LIMIT";
  exports[1669] = "ER_UNUSED4";
  exports[1670] = "ER_BINLOG_UNSAFE_SYSTEM_TABLE";
  exports[1671] = "ER_BINLOG_UNSAFE_AUTOINC_COLUMNS";
  exports[1672] = "ER_BINLOG_UNSAFE_UDF";
  exports[1673] = "ER_BINLOG_UNSAFE_SYSTEM_VARIABLE";
  exports[1674] = "ER_BINLOG_UNSAFE_SYSTEM_FUNCTION";
  exports[1675] = "ER_BINLOG_UNSAFE_NONTRANS_AFTER_TRANS";
  exports[1676] = "ER_MESSAGE_AND_STATEMENT";
  exports[1677] = "ER_SLAVE_CONVERSION_FAILED";
  exports[1678] = "ER_REPLICA_CANT_CREATE_CONVERSION";
  exports[1679] = "ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_FORMAT";
  exports[1680] = "ER_PATH_LENGTH";
  exports[1681] = "ER_WARN_DEPRECATED_SYNTAX_NO_REPLACEMENT";
  exports[1682] = "ER_WRONG_NATIVE_TABLE_STRUCTURE";
  exports[1683] = "ER_WRONG_PERFSCHEMA_USAGE";
  exports[1684] = "ER_WARN_I_S_SKIPPED_TABLE";
  exports[1685] = "ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_BINLOG_DIRECT";
  exports[1686] = "ER_STORED_FUNCTION_PREVENTS_SWITCH_BINLOG_DIRECT";
  exports[1687] = "ER_SPATIAL_MUST_HAVE_GEOM_COL";
  exports[1688] = "ER_TOO_LONG_INDEX_COMMENT";
  exports[1689] = "ER_LOCK_ABORTED";
  exports[1690] = "ER_DATA_OUT_OF_RANGE";
  exports[1691] = "ER_WRONG_SPVAR_TYPE_IN_LIMIT";
  exports[1692] = "ER_BINLOG_UNSAFE_MULTIPLE_ENGINES_AND_SELF_LOGGING_ENGINE";
  exports[1693] = "ER_BINLOG_UNSAFE_MIXED_STATEMENT";
  exports[1694] = "ER_INSIDE_TRANSACTION_PREVENTS_SWITCH_SQL_LOG_BIN";
  exports[1695] = "ER_STORED_FUNCTION_PREVENTS_SWITCH_SQL_LOG_BIN";
  exports[1696] = "ER_FAILED_READ_FROM_PAR_FILE";
  exports[1697] = "ER_VALUES_IS_NOT_INT_TYPE_ERROR";
  exports[1698] = "ER_ACCESS_DENIED_NO_PASSWORD_ERROR";
  exports[1699] = "ER_SET_PASSWORD_AUTH_PLUGIN";
  exports[1700] = "ER_GRANT_PLUGIN_USER_EXISTS";
  exports[1701] = "ER_TRUNCATE_ILLEGAL_FK";
  exports[1702] = "ER_PLUGIN_IS_PERMANENT";
  exports[1703] = "ER_REPLICA_HEARTBEAT_VALUE_OUT_OF_RANGE_MIN";
  exports[1704] = "ER_REPLICA_HEARTBEAT_VALUE_OUT_OF_RANGE_MAX";
  exports[1705] = "ER_STMT_CACHE_FULL";
  exports[1706] = "ER_MULTI_UPDATE_KEY_CONFLICT";
  exports[1707] = "ER_TABLE_NEEDS_REBUILD";
  exports[1708] = "WARN_OPTION_BELOW_LIMIT";
  exports[1709] = "ER_INDEX_COLUMN_TOO_LONG";
  exports[1710] = "ER_ERROR_IN_TRIGGER_BODY";
  exports[1711] = "ER_ERROR_IN_UNKNOWN_TRIGGER_BODY";
  exports[1712] = "ER_INDEX_CORRUPT";
  exports[1713] = "ER_UNDO_RECORD_TOO_BIG";
  exports[1714] = "ER_BINLOG_UNSAFE_INSERT_IGNORE_SELECT";
  exports[1715] = "ER_BINLOG_UNSAFE_INSERT_SELECT_UPDATE";
  exports[1716] = "ER_BINLOG_UNSAFE_REPLACE_SELECT";
  exports[1717] = "ER_BINLOG_UNSAFE_CREATE_IGNORE_SELECT";
  exports[1718] = "ER_BINLOG_UNSAFE_CREATE_REPLACE_SELECT";
  exports[1719] = "ER_BINLOG_UNSAFE_UPDATE_IGNORE";
  exports[1720] = "ER_PLUGIN_NO_UNINSTALL";
  exports[1721] = "ER_PLUGIN_NO_INSTALL";
  exports[1722] = "ER_BINLOG_UNSAFE_WRITE_AUTOINC_SELECT";
  exports[1723] = "ER_BINLOG_UNSAFE_CREATE_SELECT_AUTOINC";
  exports[1724] = "ER_BINLOG_UNSAFE_INSERT_TWO_KEYS";
  exports[1725] = "ER_TABLE_IN_FK_CHECK";
  exports[1726] = "ER_UNSUPPORTED_ENGINE";
  exports[1727] = "ER_BINLOG_UNSAFE_AUTOINC_NOT_FIRST";
  exports[1728] = "ER_CANNOT_LOAD_FROM_TABLE_V2";
  exports[1729] = "ER_SOURCE_DELAY_VALUE_OUT_OF_RANGE";
  exports[1730] = "ER_ONLY_FD_AND_RBR_EVENTS_ALLOWED_IN_BINLOG_STATEMENT";
  exports[1731] = "ER_PARTITION_EXCHANGE_DIFFERENT_OPTION";
  exports[1732] = "ER_PARTITION_EXCHANGE_PART_TABLE";
  exports[1733] = "ER_PARTITION_EXCHANGE_TEMP_TABLE";
  exports[1734] = "ER_PARTITION_INSTEAD_OF_SUBPARTITION";
  exports[1735] = "ER_UNKNOWN_PARTITION";
  exports[1736] = "ER_TABLES_DIFFERENT_METADATA";
  exports[1737] = "ER_ROW_DOES_NOT_MATCH_PARTITION";
  exports[1738] = "ER_BINLOG_CACHE_SIZE_GREATER_THAN_MAX";
  exports[1739] = "ER_WARN_INDEX_NOT_APPLICABLE";
  exports[1740] = "ER_PARTITION_EXCHANGE_FOREIGN_KEY";
  exports[1741] = "ER_NO_SUCH_KEY_VALUE";
  exports[1742] = "ER_RPL_INFO_DATA_TOO_LONG";
  exports[1743] = "ER_NETWORK_READ_EVENT_CHECKSUM_FAILURE";
  exports[1744] = "ER_BINLOG_READ_EVENT_CHECKSUM_FAILURE";
  exports[1745] = "ER_BINLOG_STMT_CACHE_SIZE_GREATER_THAN_MAX";
  exports[1746] = "ER_CANT_UPDATE_TABLE_IN_CREATE_TABLE_SELECT";
  exports[1747] = "ER_PARTITION_CLAUSE_ON_NONPARTITIONED";
  exports[1748] = "ER_ROW_DOES_NOT_MATCH_GIVEN_PARTITION_SET";
  exports[1749] = "ER_NO_SUCH_PARTITION";
  exports[1750] = "ER_CHANGE_RPL_INFO_REPOSITORY_FAILURE";
  exports[1751] = "ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_CREATED_TEMP_TABLE";
  exports[1752] = "ER_WARNING_NOT_COMPLETE_ROLLBACK_WITH_DROPPED_TEMP_TABLE";
  exports[1753] = "ER_MTA_FEATURE_IS_NOT_SUPPORTED";
  exports[1754] = "ER_MTA_UPDATED_DBS_GREATER_MAX";
  exports[1755] = "ER_MTA_CANT_PARALLEL";
  exports[1756] = "ER_MTA_INCONSISTENT_DATA";
  exports[1757] = "ER_FULLTEXT_NOT_SUPPORTED_WITH_PARTITIONING";
  exports[1758] = "ER_DA_INVALID_CONDITION_NUMBER";
  exports[1759] = "ER_INSECURE_PLAIN_TEXT";
  exports[1760] = "ER_INSECURE_CHANGE_SOURCE";
  exports[1761] = "ER_FOREIGN_DUPLICATE_KEY_WITH_CHILD_INFO";
  exports[1762] = "ER_FOREIGN_DUPLICATE_KEY_WITHOUT_CHILD_INFO";
  exports[1763] = "ER_SQLTHREAD_WITH_SECURE_REPLICA";
  exports[1764] = "ER_TABLE_HAS_NO_FT";
  exports[1765] = "ER_VARIABLE_NOT_SETTABLE_IN_SF_OR_TRIGGER";
  exports[1766] = "ER_VARIABLE_NOT_SETTABLE_IN_TRANSACTION";
  exports[1767] = "ER_GTID_NEXT_IS_NOT_IN_GTID_NEXT_LIST";
  exports[1768] = "ER_CANT_CHANGE_GTID_NEXT_IN_TRANSACTION";
  exports[1769] = "ER_SET_STATEMENT_CANNOT_INVOKE_FUNCTION";
  exports[1770] = "ER_GTID_NEXT_CANT_BE_AUTOMATIC_IF_GTID_NEXT_LIST_IS_NON_NULL";
  exports[1771] = "ER_SKIPPING_LOGGED_TRANSACTION";
  exports[1772] = "ER_MALFORMED_GTID_SET_SPECIFICATION";
  exports[1773] = "ER_MALFORMED_GTID_SET_ENCODING";
  exports[1774] = "ER_MALFORMED_GTID_SPECIFICATION";
  exports[1775] = "ER_GNO_EXHAUSTED";
  exports[1776] = "ER_BAD_REPLICA_AUTO_POSITION";
  exports[1777] = "ER_AUTO_POSITION_REQUIRES_GTID_MODE_NOT_OFF";
  exports[1778] = "ER_CANT_DO_IMPLICIT_COMMIT_IN_TRX_WHEN_GTID_NEXT_IS_SET";
  exports[1779] = "ER_GTID_MODE_ON_REQUIRES_ENFORCE_GTID_CONSISTENCY_ON";
  exports[1780] = "ER_GTID_MODE_REQUIRES_BINLOG";
  exports[1781] = "ER_CANT_SET_GTID_NEXT_TO_GTID_WHEN_GTID_MODE_IS_OFF";
  exports[1782] = "ER_CANT_SET_GTID_NEXT_TO_ANONYMOUS_WHEN_GTID_MODE_IS_ON";
  exports[1783] = "ER_CANT_SET_GTID_NEXT_LIST_TO_NON_NULL_WHEN_GTID_MODE_IS_OFF";
  exports[1784] = "ER_FOUND_GTID_EVENT_WHEN_GTID_MODE_IS_OFF";
  exports[1785] = "ER_GTID_UNSAFE_NON_TRANSACTIONAL_TABLE";
  exports[1786] = "ER_GTID_UNSAFE_CREATE_SELECT";
  exports[1787] = "ER_GTID_UNSAFE_CREATE_DROP_TEMP_TABLE_IN_TRANSACTION";
  exports[1788] = "ER_GTID_MODE_CAN_ONLY_CHANGE_ONE_STEP_AT_A_TIME";
  exports[1789] = "ER_SOURCE_HAS_PURGED_REQUIRED_GTIDS";
  exports[1790] = "ER_CANT_SET_GTID_NEXT_WHEN_OWNING_GTID";
  exports[1791] = "ER_UNKNOWN_EXPLAIN_FORMAT";
  exports[1792] = "ER_CANT_EXECUTE_IN_READ_ONLY_TRANSACTION";
  exports[1793] = "ER_TOO_LONG_TABLE_PARTITION_COMMENT";
  exports[1794] = "ER_REPLICA_CONFIGURATION";
  exports[1795] = "ER_INNODB_FT_LIMIT";
  exports[1796] = "ER_INNODB_NO_FT_TEMP_TABLE";
  exports[1797] = "ER_INNODB_FT_WRONG_DOCID_COLUMN";
  exports[1798] = "ER_INNODB_FT_WRONG_DOCID_INDEX";
  exports[1799] = "ER_INNODB_ONLINE_LOG_TOO_BIG";
  exports[1800] = "ER_UNKNOWN_ALTER_ALGORITHM";
  exports[1801] = "ER_UNKNOWN_ALTER_LOCK";
  exports[1802] = "ER_MTA_CHANGE_SOURCE_CANT_RUN_WITH_GAPS";
  exports[1803] = "ER_MTA_RECOVERY_FAILURE";
  exports[1804] = "ER_MTA_RESET_WORKERS";
  exports[1805] = "ER_COL_COUNT_DOESNT_MATCH_CORRUPTED_V2";
  exports[1806] = "ER_REPLICA_SILENT_RETRY_TRANSACTION";
  exports[1807] = "ER_DISCARD_FK_CHECKS_RUNNING";
  exports[1808] = "ER_TABLE_SCHEMA_MISMATCH";
  exports[1809] = "ER_TABLE_IN_SYSTEM_TABLESPACE";
  exports[1810] = "ER_IO_READ_ERROR";
  exports[1811] = "ER_IO_WRITE_ERROR";
  exports[1812] = "ER_TABLESPACE_MISSING";
  exports[1813] = "ER_TABLESPACE_EXISTS";
  exports[1814] = "ER_TABLESPACE_DISCARDED";
  exports[1815] = "ER_INTERNAL_ERROR";
  exports[1816] = "ER_INNODB_IMPORT_ERROR";
  exports[1817] = "ER_INNODB_INDEX_CORRUPT";
  exports[1818] = "ER_INVALID_YEAR_COLUMN_LENGTH";
  exports[1819] = "ER_NOT_VALID_PASSWORD";
  exports[1820] = "ER_MUST_CHANGE_PASSWORD";
  exports[1821] = "ER_FK_NO_INDEX_CHILD";
  exports[1822] = "ER_FK_NO_INDEX_PARENT";
  exports[1823] = "ER_FK_FAIL_ADD_SYSTEM";
  exports[1824] = "ER_FK_CANNOT_OPEN_PARENT";
  exports[1825] = "ER_FK_INCORRECT_OPTION";
  exports[1826] = "ER_FK_DUP_NAME";
  exports[1827] = "ER_PASSWORD_FORMAT";
  exports[1828] = "ER_FK_COLUMN_CANNOT_DROP";
  exports[1829] = "ER_FK_COLUMN_CANNOT_DROP_CHILD";
  exports[1830] = "ER_FK_COLUMN_NOT_NULL";
  exports[1831] = "ER_DUP_INDEX";
  exports[1832] = "ER_FK_COLUMN_CANNOT_CHANGE";
  exports[1833] = "ER_FK_COLUMN_CANNOT_CHANGE_CHILD";
  exports[1834] = "ER_UNUSED5";
  exports[1835] = "ER_MALFORMED_PACKET";
  exports[1836] = "ER_READ_ONLY_MODE";
  exports[1837] = "ER_GTID_NEXT_TYPE_UNDEFINED_GTID";
  exports[1838] = "ER_VARIABLE_NOT_SETTABLE_IN_SP";
  exports[1839] = "ER_CANT_SET_GTID_PURGED_WHEN_GTID_MODE_IS_OFF";
  exports[1840] = "ER_CANT_SET_GTID_PURGED_WHEN_GTID_EXECUTED_IS_NOT_EMPTY";
  exports[1841] = "ER_CANT_SET_GTID_PURGED_WHEN_OWNED_GTIDS_IS_NOT_EMPTY";
  exports[1842] = "ER_GTID_PURGED_WAS_CHANGED";
  exports[1843] = "ER_GTID_EXECUTED_WAS_CHANGED";
  exports[1844] = "ER_BINLOG_STMT_MODE_AND_NO_REPL_TABLES";
  exports[1845] = "ER_ALTER_OPERATION_NOT_SUPPORTED";
  exports[1846] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON";
  exports[1847] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COPY";
  exports[1848] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_PARTITION";
  exports[1849] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_RENAME";
  exports[1850] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COLUMN_TYPE";
  exports[1851] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FK_CHECK";
  exports[1852] = "ER_UNUSED6";
  exports[1853] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOPK";
  exports[1854] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_AUTOINC";
  exports[1855] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_HIDDEN_FTS";
  exports[1856] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_CHANGE_FTS";
  exports[1857] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_FTS";
  exports[1858] = "ER_SQL_REPLICA_SKIP_COUNTER_NOT_SETTABLE_IN_GTID_MODE";
  exports[1859] = "ER_DUP_UNKNOWN_IN_INDEX";
  exports[1860] = "ER_IDENT_CAUSES_TOO_LONG_PATH";
  exports[1861] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_NOT_NULL";
  exports[1862] = "ER_MUST_CHANGE_PASSWORD_LOGIN";
  exports[1863] = "ER_ROW_IN_WRONG_PARTITION";
  exports[1864] = "ER_MTA_EVENT_BIGGER_PENDING_JOBS_SIZE_MAX";
  exports[1865] = "ER_INNODB_NO_FT_USES_PARSER";
  exports[1866] = "ER_BINLOG_LOGICAL_CORRUPTION";
  exports[1867] = "ER_WARN_PURGE_LOG_IN_USE";
  exports[1868] = "ER_WARN_PURGE_LOG_IS_ACTIVE";
  exports[1869] = "ER_AUTO_INCREMENT_CONFLICT";
  exports[1870] = "WARN_ON_BLOCKHOLE_IN_RBR";
  exports[1871] = "ER_REPLICA_CM_INIT_REPOSITORY";
  exports[1872] = "ER_REPLICA_AM_INIT_REPOSITORY";
  exports[1873] = "ER_ACCESS_DENIED_CHANGE_USER_ERROR";
  exports[1874] = "ER_INNODB_READ_ONLY";
  exports[1875] = "ER_STOP_REPLICA_SQL_THREAD_TIMEOUT";
  exports[1876] = "ER_STOP_REPLICA_IO_THREAD_TIMEOUT";
  exports[1877] = "ER_TABLE_CORRUPT";
  exports[1878] = "ER_TEMP_FILE_WRITE_FAILURE";
  exports[1879] = "ER_INNODB_FT_AUX_NOT_HEX_ID";
  exports[1880] = "ER_OLD_TEMPORALS_UPGRADED";
  exports[1881] = "ER_INNODB_FORCED_RECOVERY";
  exports[1882] = "ER_AES_INVALID_IV";
  exports[1883] = "ER_PLUGIN_CANNOT_BE_UNINSTALLED";
  exports[1884] = "ER_GTID_UNSAFE_BINLOG_SPLITTABLE_STATEMENT_AND_ASSIGNED_GTID";
  exports[1885] = "ER_REPLICA_HAS_MORE_GTIDS_THAN_SOURCE";
  exports[1886] = "ER_MISSING_KEY";
  exports[1887] = "WARN_NAMED_PIPE_ACCESS_EVERYONE";
  exports[3e3] = "ER_FILE_CORRUPT";
  exports[3001] = "ER_ERROR_ON_SOURCE";
  exports[3002] = "ER_INCONSISTENT_ERROR";
  exports[3003] = "ER_STORAGE_ENGINE_NOT_LOADED";
  exports[3004] = "ER_GET_STACKED_DA_WITHOUT_ACTIVE_HANDLER";
  exports[3005] = "ER_WARN_LEGACY_SYNTAX_CONVERTED";
  exports[3006] = "ER_BINLOG_UNSAFE_FULLTEXT_PLUGIN";
  exports[3007] = "ER_CANNOT_DISCARD_TEMPORARY_TABLE";
  exports[3008] = "ER_FK_DEPTH_EXCEEDED";
  exports[3009] = "ER_COL_COUNT_DOESNT_MATCH_PLEASE_UPDATE_V2";
  exports[3010] = "ER_WARN_TRIGGER_DOESNT_HAVE_CREATED";
  exports[3011] = "ER_REFERENCED_TRG_DOES_NOT_EXIST";
  exports[3012] = "ER_EXPLAIN_NOT_SUPPORTED";
  exports[3013] = "ER_INVALID_FIELD_SIZE";
  exports[3014] = "ER_MISSING_HA_CREATE_OPTION";
  exports[3015] = "ER_ENGINE_OUT_OF_MEMORY";
  exports[3016] = "ER_PASSWORD_EXPIRE_ANONYMOUS_USER";
  exports[3017] = "ER_REPLICA_SQL_THREAD_MUST_STOP";
  exports[3018] = "ER_NO_FT_MATERIALIZED_SUBQUERY";
  exports[3019] = "ER_INNODB_UNDO_LOG_FULL";
  exports[3020] = "ER_INVALID_ARGUMENT_FOR_LOGARITHM";
  exports[3021] = "ER_REPLICA_CHANNEL_IO_THREAD_MUST_STOP";
  exports[3022] = "ER_WARN_OPEN_TEMP_TABLES_MUST_BE_ZERO";
  exports[3023] = "ER_WARN_ONLY_SOURCE_LOG_FILE_NO_POS";
  exports[3024] = "ER_QUERY_TIMEOUT";
  exports[3025] = "ER_NON_RO_SELECT_DISABLE_TIMER";
  exports[3026] = "ER_DUP_LIST_ENTRY";
  exports[3027] = "ER_SQL_MODE_NO_EFFECT";
  exports[3028] = "ER_AGGREGATE_ORDER_FOR_UNION";
  exports[3029] = "ER_AGGREGATE_ORDER_NON_AGG_QUERY";
  exports[3030] = "ER_REPLICA_WORKER_STOPPED_PREVIOUS_THD_ERROR";
  exports[3031] = "ER_DONT_SUPPORT_REPLICA_PRESERVE_COMMIT_ORDER";
  exports[3032] = "ER_SERVER_OFFLINE_MODE";
  exports[3033] = "ER_GIS_DIFFERENT_SRIDS";
  exports[3034] = "ER_GIS_UNSUPPORTED_ARGUMENT";
  exports[3035] = "ER_GIS_UNKNOWN_ERROR";
  exports[3036] = "ER_GIS_UNKNOWN_EXCEPTION";
  exports[3037] = "ER_GIS_INVALID_DATA";
  exports[3038] = "ER_BOOST_GEOMETRY_EMPTY_INPUT_EXCEPTION";
  exports[3039] = "ER_BOOST_GEOMETRY_CENTROID_EXCEPTION";
  exports[3040] = "ER_BOOST_GEOMETRY_OVERLAY_INVALID_INPUT_EXCEPTION";
  exports[3041] = "ER_BOOST_GEOMETRY_TURN_INFO_EXCEPTION";
  exports[3042] = "ER_BOOST_GEOMETRY_SELF_INTERSECTION_POINT_EXCEPTION";
  exports[3043] = "ER_BOOST_GEOMETRY_UNKNOWN_EXCEPTION";
  exports[3044] = "ER_STD_BAD_ALLOC_ERROR";
  exports[3045] = "ER_STD_DOMAIN_ERROR";
  exports[3046] = "ER_STD_LENGTH_ERROR";
  exports[3047] = "ER_STD_INVALID_ARGUMENT";
  exports[3048] = "ER_STD_OUT_OF_RANGE_ERROR";
  exports[3049] = "ER_STD_OVERFLOW_ERROR";
  exports[3050] = "ER_STD_RANGE_ERROR";
  exports[3051] = "ER_STD_UNDERFLOW_ERROR";
  exports[3052] = "ER_STD_LOGIC_ERROR";
  exports[3053] = "ER_STD_RUNTIME_ERROR";
  exports[3054] = "ER_STD_UNKNOWN_EXCEPTION";
  exports[3055] = "ER_GIS_DATA_WRONG_ENDIANESS";
  exports[3056] = "ER_CHANGE_SOURCE_PASSWORD_LENGTH";
  exports[3057] = "ER_USER_LOCK_WRONG_NAME";
  exports[3058] = "ER_USER_LOCK_DEADLOCK";
  exports[3059] = "ER_REPLACE_INACCESSIBLE_ROWS";
  exports[3060] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_GIS";
  exports[3061] = "ER_ILLEGAL_USER_VAR";
  exports[3062] = "ER_GTID_MODE_OFF";
  exports[3063] = "ER_UNSUPPORTED_BY_REPLICATION_THREAD";
  exports[3064] = "ER_INCORRECT_TYPE";
  exports[3065] = "ER_FIELD_IN_ORDER_NOT_SELECT";
  exports[3066] = "ER_AGGREGATE_IN_ORDER_NOT_SELECT";
  exports[3067] = "ER_INVALID_RPL_WILD_TABLE_FILTER_PATTERN";
  exports[3068] = "ER_NET_OK_PACKET_TOO_LARGE";
  exports[3069] = "ER_INVALID_JSON_DATA";
  exports[3070] = "ER_INVALID_GEOJSON_MISSING_MEMBER";
  exports[3071] = "ER_INVALID_GEOJSON_WRONG_TYPE";
  exports[3072] = "ER_INVALID_GEOJSON_UNSPECIFIED";
  exports[3073] = "ER_DIMENSION_UNSUPPORTED";
  exports[3074] = "ER_REPLICA_CHANNEL_DOES_NOT_EXIST";
  exports[3075] = "ER_SLAVE_MULTIPLE_CHANNELS_HOST_PORT";
  exports[3076] = "ER_REPLICA_CHANNEL_NAME_INVALID_OR_TOO_LONG";
  exports[3077] = "ER_REPLICA_NEW_CHANNEL_WRONG_REPOSITORY";
  exports[3078] = "ER_SLAVE_CHANNEL_DELETE";
  exports[3079] = "ER_REPLICA_MULTIPLE_CHANNELS_CMD";
  exports[3080] = "ER_REPLICA_MAX_CHANNELS_EXCEEDED";
  exports[3081] = "ER_REPLICA_CHANNEL_MUST_STOP";
  exports[3082] = "ER_REPLICA_CHANNEL_NOT_RUNNING";
  exports[3083] = "ER_REPLICA_CHANNEL_WAS_RUNNING";
  exports[3084] = "ER_REPLICA_CHANNEL_WAS_NOT_RUNNING";
  exports[3085] = "ER_REPLICA_CHANNEL_SQL_THREAD_MUST_STOP";
  exports[3086] = "ER_REPLICA_CHANNEL_SQL_SKIP_COUNTER";
  exports[3087] = "ER_WRONG_FIELD_WITH_GROUP_V2";
  exports[3088] = "ER_MIX_OF_GROUP_FUNC_AND_FIELDS_V2";
  exports[3089] = "ER_WARN_DEPRECATED_SYSVAR_UPDATE";
  exports[3090] = "ER_WARN_DEPRECATED_SQLMODE";
  exports[3091] = "ER_CANNOT_LOG_PARTIAL_DROP_DATABASE_WITH_GTID";
  exports[3092] = "ER_GROUP_REPLICATION_CONFIGURATION";
  exports[3093] = "ER_GROUP_REPLICATION_RUNNING";
  exports[3094] = "ER_GROUP_REPLICATION_APPLIER_INIT_ERROR";
  exports[3095] = "ER_GROUP_REPLICATION_STOP_APPLIER_THREAD_TIMEOUT";
  exports[3096] = "ER_GROUP_REPLICATION_COMMUNICATION_LAYER_SESSION_ERROR";
  exports[3097] = "ER_GROUP_REPLICATION_COMMUNICATION_LAYER_JOIN_ERROR";
  exports[3098] = "ER_BEFORE_DML_VALIDATION_ERROR";
  exports[3099] = "ER_PREVENTS_VARIABLE_WITHOUT_RBR";
  exports[3100] = "ER_RUN_HOOK_ERROR";
  exports[3101] = "ER_TRANSACTION_ROLLBACK_DURING_COMMIT";
  exports[3102] = "ER_GENERATED_COLUMN_FUNCTION_IS_NOT_ALLOWED";
  exports[3103] = "ER_UNSUPPORTED_ALTER_INPLACE_ON_VIRTUAL_COLUMN";
  exports[3104] = "ER_WRONG_FK_OPTION_FOR_GENERATED_COLUMN";
  exports[3105] = "ER_NON_DEFAULT_VALUE_FOR_GENERATED_COLUMN";
  exports[3106] = "ER_UNSUPPORTED_ACTION_ON_GENERATED_COLUMN";
  exports[3107] = "ER_GENERATED_COLUMN_NON_PRIOR";
  exports[3108] = "ER_DEPENDENT_BY_GENERATED_COLUMN";
  exports[3109] = "ER_GENERATED_COLUMN_REF_AUTO_INC";
  exports[3110] = "ER_FEATURE_NOT_AVAILABLE";
  exports[3111] = "ER_CANT_SET_GTID_MODE";
  exports[3112] = "ER_CANT_USE_AUTO_POSITION_WITH_GTID_MODE_OFF";
  exports[3113] = "ER_CANT_REPLICATE_ANONYMOUS_WITH_AUTO_POSITION";
  exports[3114] = "ER_CANT_REPLICATE_ANONYMOUS_WITH_GTID_MODE_ON";
  exports[3115] = "ER_CANT_REPLICATE_GTID_WITH_GTID_MODE_OFF";
  exports[3116] = "ER_CANT_ENFORCE_GTID_CONSISTENCY_WITH_ONGOING_GTID_VIOLATING_TX";
  exports[3117] = "ER_ENFORCE_GTID_CONSISTENCY_WARN_WITH_ONGOING_GTID_VIOLATING_TX";
  exports[3118] = "ER_ACCOUNT_HAS_BEEN_LOCKED";
  exports[3119] = "ER_WRONG_TABLESPACE_NAME";
  exports[3120] = "ER_TABLESPACE_IS_NOT_EMPTY";
  exports[3121] = "ER_WRONG_FILE_NAME";
  exports[3122] = "ER_BOOST_GEOMETRY_INCONSISTENT_TURNS_EXCEPTION";
  exports[3123] = "ER_WARN_OPTIMIZER_HINT_SYNTAX_ERROR";
  exports[3124] = "ER_WARN_BAD_MAX_EXECUTION_TIME";
  exports[3125] = "ER_WARN_UNSUPPORTED_MAX_EXECUTION_TIME";
  exports[3126] = "ER_WARN_CONFLICTING_HINT";
  exports[3127] = "ER_WARN_UNKNOWN_QB_NAME";
  exports[3128] = "ER_UNRESOLVED_HINT_NAME";
  exports[3129] = "ER_WARN_ON_MODIFYING_GTID_EXECUTED_TABLE";
  exports[3130] = "ER_PLUGGABLE_PROTOCOL_COMMAND_NOT_SUPPORTED";
  exports[3131] = "ER_LOCKING_SERVICE_WRONG_NAME";
  exports[3132] = "ER_LOCKING_SERVICE_DEADLOCK";
  exports[3133] = "ER_LOCKING_SERVICE_TIMEOUT";
  exports[3134] = "ER_GIS_MAX_POINTS_IN_GEOMETRY_OVERFLOWED";
  exports[3135] = "ER_SQL_MODE_MERGED";
  exports[3136] = "ER_VTOKEN_PLUGIN_TOKEN_MISMATCH";
  exports[3137] = "ER_VTOKEN_PLUGIN_TOKEN_NOT_FOUND";
  exports[3138] = "ER_CANT_SET_VARIABLE_WHEN_OWNING_GTID";
  exports[3139] = "ER_REPLICA_CHANNEL_OPERATION_NOT_ALLOWED";
  exports[3140] = "ER_INVALID_JSON_TEXT";
  exports[3141] = "ER_INVALID_JSON_TEXT_IN_PARAM";
  exports[3142] = "ER_INVALID_JSON_BINARY_DATA";
  exports[3143] = "ER_INVALID_JSON_PATH";
  exports[3144] = "ER_INVALID_JSON_CHARSET";
  exports[3145] = "ER_INVALID_JSON_CHARSET_IN_FUNCTION";
  exports[3146] = "ER_INVALID_TYPE_FOR_JSON";
  exports[3147] = "ER_INVALID_CAST_TO_JSON";
  exports[3148] = "ER_INVALID_JSON_PATH_CHARSET";
  exports[3149] = "ER_INVALID_JSON_PATH_WILDCARD";
  exports[3150] = "ER_JSON_VALUE_TOO_BIG";
  exports[3151] = "ER_JSON_KEY_TOO_BIG";
  exports[3152] = "ER_JSON_USED_AS_KEY";
  exports[3153] = "ER_JSON_VACUOUS_PATH";
  exports[3154] = "ER_JSON_BAD_ONE_OR_ALL_ARG";
  exports[3155] = "ER_NUMERIC_JSON_VALUE_OUT_OF_RANGE";
  exports[3156] = "ER_INVALID_JSON_VALUE_FOR_CAST";
  exports[3157] = "ER_JSON_DOCUMENT_TOO_DEEP";
  exports[3158] = "ER_JSON_DOCUMENT_NULL_KEY";
  exports[3159] = "ER_SECURE_TRANSPORT_REQUIRED";
  exports[3160] = "ER_NO_SECURE_TRANSPORTS_CONFIGURED";
  exports[3161] = "ER_DISABLED_STORAGE_ENGINE";
  exports[3162] = "ER_USER_DOES_NOT_EXIST";
  exports[3163] = "ER_USER_ALREADY_EXISTS";
  exports[3164] = "ER_AUDIT_API_ABORT";
  exports[3165] = "ER_INVALID_JSON_PATH_ARRAY_CELL";
  exports[3166] = "ER_BUFPOOL_RESIZE_INPROGRESS";
  exports[3167] = "ER_FEATURE_DISABLED_SEE_DOC";
  exports[3168] = "ER_SERVER_ISNT_AVAILABLE";
  exports[3169] = "ER_SESSION_WAS_KILLED";
  exports[3170] = "ER_CAPACITY_EXCEEDED";
  exports[3171] = "ER_CAPACITY_EXCEEDED_IN_RANGE_OPTIMIZER";
  exports[3172] = "ER_TABLE_NEEDS_UPG_PART";
  exports[3173] = "ER_CANT_WAIT_FOR_EXECUTED_GTID_SET_WHILE_OWNING_A_GTID";
  exports[3174] = "ER_CANNOT_ADD_FOREIGN_BASE_COL_VIRTUAL";
  exports[3175] = "ER_CANNOT_CREATE_VIRTUAL_INDEX_CONSTRAINT";
  exports[3176] = "ER_ERROR_ON_MODIFYING_GTID_EXECUTED_TABLE";
  exports[3177] = "ER_LOCK_REFUSED_BY_ENGINE";
  exports[3178] = "ER_UNSUPPORTED_ALTER_ONLINE_ON_VIRTUAL_COLUMN";
  exports[3179] = "ER_MASTER_KEY_ROTATION_NOT_SUPPORTED_BY_SE";
  exports[3180] = "ER_MASTER_KEY_ROTATION_ERROR_BY_SE";
  exports[3181] = "ER_MASTER_KEY_ROTATION_BINLOG_FAILED";
  exports[3182] = "ER_MASTER_KEY_ROTATION_SE_UNAVAILABLE";
  exports[3183] = "ER_TABLESPACE_CANNOT_ENCRYPT";
  exports[3184] = "ER_INVALID_ENCRYPTION_OPTION";
  exports[3185] = "ER_CANNOT_FIND_KEY_IN_KEYRING";
  exports[3186] = "ER_CAPACITY_EXCEEDED_IN_PARSER";
  exports[3187] = "ER_UNSUPPORTED_ALTER_ENCRYPTION_INPLACE";
  exports[3188] = "ER_KEYRING_UDF_KEYRING_SERVICE_ERROR";
  exports[3189] = "ER_USER_COLUMN_OLD_LENGTH";
  exports[3190] = "ER_CANT_RESET_SOURCE";
  exports[3191] = "ER_GROUP_REPLICATION_MAX_GROUP_SIZE";
  exports[3192] = "ER_CANNOT_ADD_FOREIGN_BASE_COL_STORED";
  exports[3193] = "ER_TABLE_REFERENCED";
  exports[3194] = "ER_PARTITION_ENGINE_DEPRECATED_FOR_TABLE";
  exports[3195] = "ER_WARN_USING_GEOMFROMWKB_TO_SET_SRID_ZERO";
  exports[3196] = "ER_WARN_USING_GEOMFROMWKB_TO_SET_SRID";
  exports[3197] = "ER_XA_RETRY";
  exports[3198] = "ER_KEYRING_AWS_UDF_AWS_KMS_ERROR";
  exports[3199] = "ER_BINLOG_UNSAFE_XA";
  exports[3200] = "ER_UDF_ERROR";
  exports[3201] = "ER_KEYRING_MIGRATION_FAILURE";
  exports[3202] = "ER_KEYRING_ACCESS_DENIED_ERROR";
  exports[3203] = "ER_KEYRING_MIGRATION_STATUS";
  exports[3204] = "ER_PLUGIN_FAILED_TO_OPEN_TABLES";
  exports[3205] = "ER_PLUGIN_FAILED_TO_OPEN_TABLE";
  exports[3206] = "ER_AUDIT_LOG_NO_KEYRING_PLUGIN_INSTALLED";
  exports[3207] = "ER_AUDIT_LOG_ENCRYPTION_PASSWORD_HAS_NOT_BEEN_SET";
  exports[3208] = "ER_AUDIT_LOG_COULD_NOT_CREATE_AES_KEY";
  exports[3209] = "ER_AUDIT_LOG_ENCRYPTION_PASSWORD_CANNOT_BE_FETCHED";
  exports[3210] = "ER_AUDIT_LOG_JSON_FILTERING_NOT_ENABLED";
  exports[3211] = "ER_AUDIT_LOG_UDF_INSUFFICIENT_PRIVILEGE";
  exports[3212] = "ER_AUDIT_LOG_SUPER_PRIVILEGE_REQUIRED";
  exports[3213] = "ER_COULD_NOT_REINITIALIZE_AUDIT_LOG_FILTERS";
  exports[3214] = "ER_AUDIT_LOG_UDF_INVALID_ARGUMENT_TYPE";
  exports[3215] = "ER_AUDIT_LOG_UDF_INVALID_ARGUMENT_COUNT";
  exports[3216] = "ER_AUDIT_LOG_HAS_NOT_BEEN_INSTALLED";
  exports[3217] = "ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_TYPE";
  exports[3218] = "ER_AUDIT_LOG_UDF_READ_INVALID_MAX_ARRAY_LENGTH_ARG_VALUE";
  exports[3219] = "ER_AUDIT_LOG_JSON_FILTER_PARSING_ERROR";
  exports[3220] = "ER_AUDIT_LOG_JSON_FILTER_NAME_CANNOT_BE_EMPTY";
  exports[3221] = "ER_AUDIT_LOG_JSON_USER_NAME_CANNOT_BE_EMPTY";
  exports[3222] = "ER_AUDIT_LOG_JSON_FILTER_DOES_NOT_EXISTS";
  exports[3223] = "ER_AUDIT_LOG_USER_FIRST_CHARACTER_MUST_BE_ALPHANUMERIC";
  exports[3224] = "ER_AUDIT_LOG_USER_NAME_INVALID_CHARACTER";
  exports[3225] = "ER_AUDIT_LOG_HOST_NAME_INVALID_CHARACTER";
  exports[3226] = "WARN_DEPRECATED_MAXDB_SQL_MODE_FOR_TIMESTAMP";
  exports[3227] = "ER_XA_REPLICATION_FILTERS";
  exports[3228] = "ER_CANT_OPEN_ERROR_LOG";
  exports[3229] = "ER_GROUPING_ON_TIMESTAMP_IN_DST";
  exports[3230] = "ER_CANT_START_SERVER_NAMED_PIPE";
  exports[3231] = "ER_WRITE_SET_EXCEEDS_LIMIT";
  exports[3232] = "ER_DEPRECATED_TLS_VERSION_SESSION_57";
  exports[3233] = "ER_WARN_DEPRECATED_TLS_VERSION_57";
  exports[3234] = "ER_WARN_WRONG_NATIVE_TABLE_STRUCTURE";
  exports[3235] = "ER_AES_INVALID_KDF_NAME";
  exports[3236] = "ER_AES_INVALID_KDF_ITERATIONS";
  exports[3237] = "WARN_AES_KEY_SIZE";
  exports[3238] = "ER_AES_INVALID_KDF_OPTION_SIZE";
  exports[3500] = "ER_UNSUPPORT_COMPRESSED_TEMPORARY_TABLE";
  exports[3501] = "ER_ACL_OPERATION_FAILED";
  exports[3502] = "ER_UNSUPPORTED_INDEX_ALGORITHM";
  exports[3503] = "ER_NO_SUCH_DB";
  exports[3504] = "ER_TOO_BIG_ENUM";
  exports[3505] = "ER_TOO_LONG_SET_ENUM_VALUE";
  exports[3506] = "ER_INVALID_DD_OBJECT";
  exports[3507] = "ER_UPDATING_DD_TABLE";
  exports[3508] = "ER_INVALID_DD_OBJECT_ID";
  exports[3509] = "ER_INVALID_DD_OBJECT_NAME";
  exports[3510] = "ER_TABLESPACE_MISSING_WITH_NAME";
  exports[3511] = "ER_TOO_LONG_ROUTINE_COMMENT";
  exports[3512] = "ER_SP_LOAD_FAILED";
  exports[3513] = "ER_INVALID_BITWISE_OPERANDS_SIZE";
  exports[3514] = "ER_INVALID_BITWISE_AGGREGATE_OPERANDS_SIZE";
  exports[3515] = "ER_WARN_UNSUPPORTED_HINT";
  exports[3516] = "ER_UNEXPECTED_GEOMETRY_TYPE";
  exports[3517] = "ER_SRS_PARSE_ERROR";
  exports[3518] = "ER_SRS_PROJ_PARAMETER_MISSING";
  exports[3519] = "ER_WARN_SRS_NOT_FOUND";
  exports[3520] = "ER_SRS_NOT_CARTESIAN";
  exports[3521] = "ER_SRS_NOT_CARTESIAN_UNDEFINED";
  exports[3522] = "ER_PK_INDEX_CANT_BE_INVISIBLE";
  exports[3523] = "ER_UNKNOWN_AUTHID";
  exports[3524] = "ER_FAILED_ROLE_GRANT";
  exports[3525] = "ER_OPEN_ROLE_TABLES";
  exports[3526] = "ER_FAILED_DEFAULT_ROLES";
  exports[3527] = "ER_COMPONENTS_NO_SCHEME";
  exports[3528] = "ER_COMPONENTS_NO_SCHEME_SERVICE";
  exports[3529] = "ER_COMPONENTS_CANT_LOAD";
  exports[3530] = "ER_ROLE_NOT_GRANTED";
  exports[3531] = "ER_FAILED_REVOKE_ROLE";
  exports[3532] = "ER_RENAME_ROLE";
  exports[3533] = "ER_COMPONENTS_CANT_ACQUIRE_SERVICE_IMPLEMENTATION";
  exports[3534] = "ER_COMPONENTS_CANT_SATISFY_DEPENDENCY";
  exports[3535] = "ER_COMPONENTS_LOAD_CANT_REGISTER_SERVICE_IMPLEMENTATION";
  exports[3536] = "ER_COMPONENTS_LOAD_CANT_INITIALIZE";
  exports[3537] = "ER_COMPONENTS_UNLOAD_NOT_LOADED";
  exports[3538] = "ER_COMPONENTS_UNLOAD_CANT_DEINITIALIZE";
  exports[3539] = "ER_COMPONENTS_CANT_RELEASE_SERVICE";
  exports[3540] = "ER_COMPONENTS_UNLOAD_CANT_UNREGISTER_SERVICE";
  exports[3541] = "ER_COMPONENTS_CANT_UNLOAD";
  exports[3542] = "ER_WARN_UNLOAD_THE_NOT_PERSISTED";
  exports[3543] = "ER_COMPONENT_TABLE_INCORRECT";
  exports[3544] = "ER_COMPONENT_MANIPULATE_ROW_FAILED";
  exports[3545] = "ER_COMPONENTS_UNLOAD_DUPLICATE_IN_GROUP";
  exports[3546] = "ER_CANT_SET_GTID_PURGED_DUE_SETS_CONSTRAINTS";
  exports[3547] = "ER_CANNOT_LOCK_USER_MANAGEMENT_CACHES";
  exports[3548] = "ER_SRS_NOT_FOUND";
  exports[3549] = "ER_VARIABLE_NOT_PERSISTED";
  exports[3550] = "ER_IS_QUERY_INVALID_CLAUSE";
  exports[3551] = "ER_UNABLE_TO_STORE_STATISTICS";
  exports[3552] = "ER_NO_SYSTEM_SCHEMA_ACCESS";
  exports[3553] = "ER_NO_SYSTEM_TABLESPACE_ACCESS";
  exports[3554] = "ER_NO_SYSTEM_TABLE_ACCESS";
  exports[3555] = "ER_NO_SYSTEM_TABLE_ACCESS_FOR_DICTIONARY_TABLE";
  exports[3556] = "ER_NO_SYSTEM_TABLE_ACCESS_FOR_SYSTEM_TABLE";
  exports[3557] = "ER_NO_SYSTEM_TABLE_ACCESS_FOR_TABLE";
  exports[3558] = "ER_INVALID_OPTION_KEY";
  exports[3559] = "ER_INVALID_OPTION_VALUE";
  exports[3560] = "ER_INVALID_OPTION_KEY_VALUE_PAIR";
  exports[3561] = "ER_INVALID_OPTION_START_CHARACTER";
  exports[3562] = "ER_INVALID_OPTION_END_CHARACTER";
  exports[3563] = "ER_INVALID_OPTION_CHARACTERS";
  exports[3564] = "ER_DUPLICATE_OPTION_KEY";
  exports[3565] = "ER_WARN_SRS_NOT_FOUND_AXIS_ORDER";
  exports[3566] = "ER_NO_ACCESS_TO_NATIVE_FCT";
  exports[3567] = "ER_RESET_SOURCE_TO_VALUE_OUT_OF_RANGE";
  exports[3568] = "ER_UNRESOLVED_TABLE_LOCK";
  exports[3569] = "ER_DUPLICATE_TABLE_LOCK";
  exports[3570] = "ER_BINLOG_UNSAFE_SKIP_LOCKED";
  exports[3571] = "ER_BINLOG_UNSAFE_NOWAIT";
  exports[3572] = "ER_LOCK_NOWAIT";
  exports[3573] = "ER_CTE_RECURSIVE_REQUIRES_UNION";
  exports[3574] = "ER_CTE_RECURSIVE_REQUIRES_NONRECURSIVE_FIRST";
  exports[3575] = "ER_CTE_RECURSIVE_FORBIDS_AGGREGATION";
  exports[3576] = "ER_CTE_RECURSIVE_FORBIDDEN_JOIN_ORDER";
  exports[3577] = "ER_CTE_RECURSIVE_REQUIRES_SINGLE_REFERENCE";
  exports[3578] = "ER_SWITCH_TMP_ENGINE";
  exports[3579] = "ER_WINDOW_NO_SUCH_WINDOW";
  exports[3580] = "ER_WINDOW_CIRCULARITY_IN_WINDOW_GRAPH";
  exports[3581] = "ER_WINDOW_NO_CHILD_PARTITIONING";
  exports[3582] = "ER_WINDOW_NO_INHERIT_FRAME";
  exports[3583] = "ER_WINDOW_NO_REDEFINE_ORDER_BY";
  exports[3584] = "ER_WINDOW_FRAME_START_ILLEGAL";
  exports[3585] = "ER_WINDOW_FRAME_END_ILLEGAL";
  exports[3586] = "ER_WINDOW_FRAME_ILLEGAL";
  exports[3587] = "ER_WINDOW_RANGE_FRAME_ORDER_TYPE";
  exports[3588] = "ER_WINDOW_RANGE_FRAME_TEMPORAL_TYPE";
  exports[3589] = "ER_WINDOW_RANGE_FRAME_NUMERIC_TYPE";
  exports[3590] = "ER_WINDOW_RANGE_BOUND_NOT_CONSTANT";
  exports[3591] = "ER_WINDOW_DUPLICATE_NAME";
  exports[3592] = "ER_WINDOW_ILLEGAL_ORDER_BY";
  exports[3593] = "ER_WINDOW_INVALID_WINDOW_FUNC_USE";
  exports[3594] = "ER_WINDOW_INVALID_WINDOW_FUNC_ALIAS_USE";
  exports[3595] = "ER_WINDOW_NESTED_WINDOW_FUNC_USE_IN_WINDOW_SPEC";
  exports[3596] = "ER_WINDOW_ROWS_INTERVAL_USE";
  exports[3597] = "ER_WINDOW_NO_GROUP_ORDER";
  exports[3598] = "ER_WINDOW_EXPLAIN_JSON";
  exports[3599] = "ER_WINDOW_FUNCTION_IGNORES_FRAME";
  exports[3600] = "ER_WL9236_NOW";
  exports[3601] = "ER_INVALID_NO_OF_ARGS";
  exports[3602] = "ER_FIELD_IN_GROUPING_NOT_GROUP_BY";
  exports[3603] = "ER_TOO_LONG_TABLESPACE_COMMENT";
  exports[3604] = "ER_ENGINE_CANT_DROP_TABLE";
  exports[3605] = "ER_ENGINE_CANT_DROP_MISSING_TABLE";
  exports[3606] = "ER_TABLESPACE_DUP_FILENAME";
  exports[3607] = "ER_DB_DROP_RMDIR2";
  exports[3608] = "ER_IMP_NO_FILES_MATCHED";
  exports[3609] = "ER_IMP_SCHEMA_DOES_NOT_EXIST";
  exports[3610] = "ER_IMP_TABLE_ALREADY_EXISTS";
  exports[3611] = "ER_IMP_INCOMPATIBLE_MYSQLD_VERSION";
  exports[3612] = "ER_IMP_INCOMPATIBLE_DD_VERSION";
  exports[3613] = "ER_IMP_INCOMPATIBLE_SDI_VERSION";
  exports[3614] = "ER_WARN_INVALID_HINT";
  exports[3615] = "ER_VAR_DOES_NOT_EXIST";
  exports[3616] = "ER_LONGITUDE_OUT_OF_RANGE";
  exports[3617] = "ER_LATITUDE_OUT_OF_RANGE";
  exports[3618] = "ER_NOT_IMPLEMENTED_FOR_GEOGRAPHIC_SRS";
  exports[3619] = "ER_ILLEGAL_PRIVILEGE_LEVEL";
  exports[3620] = "ER_NO_SYSTEM_VIEW_ACCESS";
  exports[3621] = "ER_COMPONENT_FILTER_FLABBERGASTED";
  exports[3622] = "ER_PART_EXPR_TOO_LONG";
  exports[3623] = "ER_UDF_DROP_DYNAMICALLY_REGISTERED";
  exports[3624] = "ER_UNABLE_TO_STORE_COLUMN_STATISTICS";
  exports[3625] = "ER_UNABLE_TO_UPDATE_COLUMN_STATISTICS";
  exports[3626] = "ER_UNABLE_TO_DROP_COLUMN_STATISTICS";
  exports[3627] = "ER_UNABLE_TO_BUILD_HISTOGRAM";
  exports[3628] = "ER_MANDATORY_ROLE";
  exports[3629] = "ER_MISSING_TABLESPACE_FILE";
  exports[3630] = "ER_PERSIST_ONLY_ACCESS_DENIED_ERROR";
  exports[3631] = "ER_CMD_NEED_SUPER";
  exports[3632] = "ER_PATH_IN_DATADIR";
  exports[3633] = "ER_CLONE_DDL_IN_PROGRESS";
  exports[3634] = "ER_CLONE_TOO_MANY_CONCURRENT_CLONES";
  exports[3635] = "ER_APPLIER_LOG_EVENT_VALIDATION_ERROR";
  exports[3636] = "ER_CTE_MAX_RECURSION_DEPTH";
  exports[3637] = "ER_NOT_HINT_UPDATABLE_VARIABLE";
  exports[3638] = "ER_CREDENTIALS_CONTRADICT_TO_HISTORY";
  exports[3639] = "ER_WARNING_PASSWORD_HISTORY_CLAUSES_VOID";
  exports[3640] = "ER_CLIENT_DOES_NOT_SUPPORT";
  exports[3641] = "ER_I_S_SKIPPED_TABLESPACE";
  exports[3642] = "ER_TABLESPACE_ENGINE_MISMATCH";
  exports[3643] = "ER_WRONG_SRID_FOR_COLUMN";
  exports[3644] = "ER_CANNOT_ALTER_SRID_DUE_TO_INDEX";
  exports[3645] = "ER_WARN_BINLOG_PARTIAL_UPDATES_DISABLED";
  exports[3646] = "ER_WARN_BINLOG_V1_ROW_EVENTS_DISABLED";
  exports[3647] = "ER_WARN_BINLOG_PARTIAL_UPDATES_SUGGESTS_PARTIAL_IMAGES";
  exports[3648] = "ER_COULD_NOT_APPLY_JSON_DIFF";
  exports[3649] = "ER_CORRUPTED_JSON_DIFF";
  exports[3650] = "ER_RESOURCE_GROUP_EXISTS";
  exports[3651] = "ER_RESOURCE_GROUP_NOT_EXISTS";
  exports[3652] = "ER_INVALID_VCPU_ID";
  exports[3653] = "ER_INVALID_VCPU_RANGE";
  exports[3654] = "ER_INVALID_THREAD_PRIORITY";
  exports[3655] = "ER_DISALLOWED_OPERATION";
  exports[3656] = "ER_RESOURCE_GROUP_BUSY";
  exports[3657] = "ER_RESOURCE_GROUP_DISABLED";
  exports[3658] = "ER_FEATURE_UNSUPPORTED";
  exports[3659] = "ER_ATTRIBUTE_IGNORED";
  exports[3660] = "ER_INVALID_THREAD_ID";
  exports[3661] = "ER_RESOURCE_GROUP_BIND_FAILED";
  exports[3662] = "ER_INVALID_USE_OF_FORCE_OPTION";
  exports[3663] = "ER_GROUP_REPLICATION_COMMAND_FAILURE";
  exports[3664] = "ER_SDI_OPERATION_FAILED";
  exports[3665] = "ER_MISSING_JSON_TABLE_VALUE";
  exports[3666] = "ER_WRONG_JSON_TABLE_VALUE";
  exports[3667] = "ER_TF_MUST_HAVE_ALIAS";
  exports[3668] = "ER_TF_FORBIDDEN_JOIN_TYPE";
  exports[3669] = "ER_JT_VALUE_OUT_OF_RANGE";
  exports[3670] = "ER_JT_MAX_NESTED_PATH";
  exports[3671] = "ER_PASSWORD_EXPIRATION_NOT_SUPPORTED_BY_AUTH_METHOD";
  exports[3672] = "ER_INVALID_GEOJSON_CRS_NOT_TOP_LEVEL";
  exports[3673] = "ER_BAD_NULL_ERROR_NOT_IGNORED";
  exports[3674] = "WARN_USELESS_SPATIAL_INDEX";
  exports[3675] = "ER_DISK_FULL_NOWAIT";
  exports[3676] = "ER_PARSE_ERROR_IN_DIGEST_FN";
  exports[3677] = "ER_UNDISCLOSED_PARSE_ERROR_IN_DIGEST_FN";
  exports[3678] = "ER_SCHEMA_DIR_EXISTS";
  exports[3679] = "ER_SCHEMA_DIR_MISSING";
  exports[3680] = "ER_SCHEMA_DIR_CREATE_FAILED";
  exports[3681] = "ER_SCHEMA_DIR_UNKNOWN";
  exports[3682] = "ER_ONLY_IMPLEMENTED_FOR_SRID_0_AND_4326";
  exports[3683] = "ER_BINLOG_EXPIRE_LOG_DAYS_AND_SECS_USED_TOGETHER";
  exports[3684] = "ER_REGEXP_BUFFER_OVERFLOW";
  exports[3685] = "ER_REGEXP_ILLEGAL_ARGUMENT";
  exports[3686] = "ER_REGEXP_INDEX_OUTOFBOUNDS_ERROR";
  exports[3687] = "ER_REGEXP_INTERNAL_ERROR";
  exports[3688] = "ER_REGEXP_RULE_SYNTAX";
  exports[3689] = "ER_REGEXP_BAD_ESCAPE_SEQUENCE";
  exports[3690] = "ER_REGEXP_UNIMPLEMENTED";
  exports[3691] = "ER_REGEXP_MISMATCHED_PAREN";
  exports[3692] = "ER_REGEXP_BAD_INTERVAL";
  exports[3693] = "ER_REGEXP_MAX_LT_MIN";
  exports[3694] = "ER_REGEXP_INVALID_BACK_REF";
  exports[3695] = "ER_REGEXP_LOOK_BEHIND_LIMIT";
  exports[3696] = "ER_REGEXP_MISSING_CLOSE_BRACKET";
  exports[3697] = "ER_REGEXP_INVALID_RANGE";
  exports[3698] = "ER_REGEXP_STACK_OVERFLOW";
  exports[3699] = "ER_REGEXP_TIME_OUT";
  exports[3700] = "ER_REGEXP_PATTERN_TOO_BIG";
  exports[3701] = "ER_CANT_SET_ERROR_LOG_SERVICE";
  exports[3702] = "ER_EMPTY_PIPELINE_FOR_ERROR_LOG_SERVICE";
  exports[3703] = "ER_COMPONENT_FILTER_DIAGNOSTICS";
  exports[3704] = "ER_NOT_IMPLEMENTED_FOR_CARTESIAN_SRS";
  exports[3705] = "ER_NOT_IMPLEMENTED_FOR_PROJECTED_SRS";
  exports[3706] = "ER_NONPOSITIVE_RADIUS";
  exports[3707] = "ER_RESTART_SERVER_FAILED";
  exports[3708] = "ER_SRS_MISSING_MANDATORY_ATTRIBUTE";
  exports[3709] = "ER_SRS_MULTIPLE_ATTRIBUTE_DEFINITIONS";
  exports[3710] = "ER_SRS_NAME_CANT_BE_EMPTY_OR_WHITESPACE";
  exports[3711] = "ER_SRS_ORGANIZATION_CANT_BE_EMPTY_OR_WHITESPACE";
  exports[3712] = "ER_SRS_ID_ALREADY_EXISTS";
  exports[3713] = "ER_WARN_SRS_ID_ALREADY_EXISTS";
  exports[3714] = "ER_CANT_MODIFY_SRID_0";
  exports[3715] = "ER_WARN_RESERVED_SRID_RANGE";
  exports[3716] = "ER_CANT_MODIFY_SRS_USED_BY_COLUMN";
  exports[3717] = "ER_SRS_INVALID_CHARACTER_IN_ATTRIBUTE";
  exports[3718] = "ER_SRS_ATTRIBUTE_STRING_TOO_LONG";
  exports[3719] = "ER_DEPRECATED_UTF8_ALIAS";
  exports[3720] = "ER_DEPRECATED_NATIONAL";
  exports[3721] = "ER_INVALID_DEFAULT_UTF8MB4_COLLATION";
  exports[3722] = "ER_UNABLE_TO_COLLECT_LOG_STATUS";
  exports[3723] = "ER_RESERVED_TABLESPACE_NAME";
  exports[3724] = "ER_UNABLE_TO_SET_OPTION";
  exports[3725] = "ER_REPLICA_POSSIBLY_DIVERGED_AFTER_DDL";
  exports[3726] = "ER_SRS_NOT_GEOGRAPHIC";
  exports[3727] = "ER_POLYGON_TOO_LARGE";
  exports[3728] = "ER_SPATIAL_UNIQUE_INDEX";
  exports[3729] = "ER_INDEX_TYPE_NOT_SUPPORTED_FOR_SPATIAL_INDEX";
  exports[3730] = "ER_FK_CANNOT_DROP_PARENT";
  exports[3731] = "ER_GEOMETRY_PARAM_LONGITUDE_OUT_OF_RANGE";
  exports[3732] = "ER_GEOMETRY_PARAM_LATITUDE_OUT_OF_RANGE";
  exports[3733] = "ER_FK_CANNOT_USE_VIRTUAL_COLUMN";
  exports[3734] = "ER_FK_NO_COLUMN_PARENT";
  exports[3735] = "ER_CANT_SET_ERROR_SUPPRESSION_LIST";
  exports[3736] = "ER_SRS_GEOGCS_INVALID_AXES";
  exports[3737] = "ER_SRS_INVALID_SEMI_MAJOR_AXIS";
  exports[3738] = "ER_SRS_INVALID_INVERSE_FLATTENING";
  exports[3739] = "ER_SRS_INVALID_ANGULAR_UNIT";
  exports[3740] = "ER_SRS_INVALID_PRIME_MERIDIAN";
  exports[3741] = "ER_TRANSFORM_SOURCE_SRS_NOT_SUPPORTED";
  exports[3742] = "ER_TRANSFORM_TARGET_SRS_NOT_SUPPORTED";
  exports[3743] = "ER_TRANSFORM_SOURCE_SRS_MISSING_TOWGS84";
  exports[3744] = "ER_TRANSFORM_TARGET_SRS_MISSING_TOWGS84";
  exports[3745] = "ER_TEMP_TABLE_PREVENTS_SWITCH_SESSION_BINLOG_FORMAT";
  exports[3746] = "ER_TEMP_TABLE_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT";
  exports[3747] = "ER_RUNNING_APPLIER_PREVENTS_SWITCH_GLOBAL_BINLOG_FORMAT";
  exports[3748] = "ER_CLIENT_GTID_UNSAFE_CREATE_DROP_TEMP_TABLE_IN_TRX_IN_SBR";
  exports[3749] = "ER_XA_CANT_CREATE_MDL_BACKUP";
  exports[3750] = "ER_TABLE_WITHOUT_PK";
  exports[3751] = "ER_WARN_DATA_TRUNCATED_FUNCTIONAL_INDEX";
  exports[3752] = "ER_WARN_DATA_OUT_OF_RANGE_FUNCTIONAL_INDEX";
  exports[3753] = "ER_FUNCTIONAL_INDEX_ON_JSON_OR_GEOMETRY_FUNCTION";
  exports[3754] = "ER_FUNCTIONAL_INDEX_REF_AUTO_INCREMENT";
  exports[3755] = "ER_CANNOT_DROP_COLUMN_FUNCTIONAL_INDEX";
  exports[3756] = "ER_FUNCTIONAL_INDEX_PRIMARY_KEY";
  exports[3757] = "ER_FUNCTIONAL_INDEX_ON_LOB";
  exports[3758] = "ER_FUNCTIONAL_INDEX_FUNCTION_IS_NOT_ALLOWED";
  exports[3759] = "ER_FULLTEXT_FUNCTIONAL_INDEX";
  exports[3760] = "ER_SPATIAL_FUNCTIONAL_INDEX";
  exports[3761] = "ER_WRONG_KEY_COLUMN_FUNCTIONAL_INDEX";
  exports[3762] = "ER_FUNCTIONAL_INDEX_ON_FIELD";
  exports[3763] = "ER_GENERATED_COLUMN_NAMED_FUNCTION_IS_NOT_ALLOWED";
  exports[3764] = "ER_GENERATED_COLUMN_ROW_VALUE";
  exports[3765] = "ER_GENERATED_COLUMN_VARIABLES";
  exports[3766] = "ER_DEPENDENT_BY_DEFAULT_GENERATED_VALUE";
  exports[3767] = "ER_DEFAULT_VAL_GENERATED_NON_PRIOR";
  exports[3768] = "ER_DEFAULT_VAL_GENERATED_REF_AUTO_INC";
  exports[3769] = "ER_DEFAULT_VAL_GENERATED_FUNCTION_IS_NOT_ALLOWED";
  exports[3770] = "ER_DEFAULT_VAL_GENERATED_NAMED_FUNCTION_IS_NOT_ALLOWED";
  exports[3771] = "ER_DEFAULT_VAL_GENERATED_ROW_VALUE";
  exports[3772] = "ER_DEFAULT_VAL_GENERATED_VARIABLES";
  exports[3773] = "ER_DEFAULT_AS_VAL_GENERATED";
  exports[3774] = "ER_UNSUPPORTED_ACTION_ON_DEFAULT_VAL_GENERATED";
  exports[3775] = "ER_GTID_UNSAFE_ALTER_ADD_COL_WITH_DEFAULT_EXPRESSION";
  exports[3776] = "ER_FK_CANNOT_CHANGE_ENGINE";
  exports[3777] = "ER_WARN_DEPRECATED_USER_SET_EXPR";
  exports[3778] = "ER_WARN_DEPRECATED_UTF8MB3_COLLATION";
  exports[3779] = "ER_WARN_DEPRECATED_NESTED_COMMENT_SYNTAX";
  exports[3780] = "ER_FK_INCOMPATIBLE_COLUMNS";
  exports[3781] = "ER_GR_HOLD_WAIT_TIMEOUT";
  exports[3782] = "ER_GR_HOLD_KILLED";
  exports[3783] = "ER_GR_HOLD_MEMBER_STATUS_ERROR";
  exports[3784] = "ER_RPL_ENCRYPTION_FAILED_TO_FETCH_KEY";
  exports[3785] = "ER_RPL_ENCRYPTION_KEY_NOT_FOUND";
  exports[3786] = "ER_RPL_ENCRYPTION_KEYRING_INVALID_KEY";
  exports[3787] = "ER_RPL_ENCRYPTION_HEADER_ERROR";
  exports[3788] = "ER_RPL_ENCRYPTION_FAILED_TO_ROTATE_LOGS";
  exports[3789] = "ER_RPL_ENCRYPTION_KEY_EXISTS_UNEXPECTED";
  exports[3790] = "ER_RPL_ENCRYPTION_FAILED_TO_GENERATE_KEY";
  exports[3791] = "ER_RPL_ENCRYPTION_FAILED_TO_STORE_KEY";
  exports[3792] = "ER_RPL_ENCRYPTION_FAILED_TO_REMOVE_KEY";
  exports[3793] = "ER_RPL_ENCRYPTION_UNABLE_TO_CHANGE_OPTION";
  exports[3794] = "ER_RPL_ENCRYPTION_MASTER_KEY_RECOVERY_FAILED";
  exports[3795] = "ER_SLOW_LOG_MODE_IGNORED_WHEN_NOT_LOGGING_TO_FILE";
  exports[3796] = "ER_GRP_TRX_CONSISTENCY_NOT_ALLOWED";
  exports[3797] = "ER_GRP_TRX_CONSISTENCY_BEFORE";
  exports[3798] = "ER_GRP_TRX_CONSISTENCY_AFTER_ON_TRX_BEGIN";
  exports[3799] = "ER_GRP_TRX_CONSISTENCY_BEGIN_NOT_ALLOWED";
  exports[3800] = "ER_FUNCTIONAL_INDEX_ROW_VALUE_IS_NOT_ALLOWED";
  exports[3801] = "ER_RPL_ENCRYPTION_FAILED_TO_ENCRYPT";
  exports[3802] = "ER_PAGE_TRACKING_NOT_STARTED";
  exports[3803] = "ER_PAGE_TRACKING_RANGE_NOT_TRACKED";
  exports[3804] = "ER_PAGE_TRACKING_CANNOT_PURGE";
  exports[3805] = "ER_RPL_ENCRYPTION_CANNOT_ROTATE_BINLOG_MASTER_KEY";
  exports[3806] = "ER_BINLOG_MASTER_KEY_RECOVERY_OUT_OF_COMBINATION";
  exports[3807] = "ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_OPERATE_KEY";
  exports[3808] = "ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_ROTATE_LOGS";
  exports[3809] = "ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_REENCRYPT_LOG";
  exports[3810] = "ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_UNUSED_KEYS";
  exports[3811] = "ER_BINLOG_MASTER_KEY_ROTATION_FAIL_TO_CLEANUP_AUX_KEY";
  exports[3812] = "ER_NON_BOOLEAN_EXPR_FOR_CHECK_CONSTRAINT";
  exports[3813] = "ER_COLUMN_CHECK_CONSTRAINT_REFERENCES_OTHER_COLUMN";
  exports[3814] = "ER_CHECK_CONSTRAINT_NAMED_FUNCTION_IS_NOT_ALLOWED";
  exports[3815] = "ER_CHECK_CONSTRAINT_FUNCTION_IS_NOT_ALLOWED";
  exports[3816] = "ER_CHECK_CONSTRAINT_VARIABLES";
  exports[3817] = "ER_CHECK_CONSTRAINT_ROW_VALUE";
  exports[3818] = "ER_CHECK_CONSTRAINT_REFERS_AUTO_INCREMENT_COLUMN";
  exports[3819] = "ER_CHECK_CONSTRAINT_VIOLATED";
  exports[3820] = "ER_CHECK_CONSTRAINT_REFERS_UNKNOWN_COLUMN";
  exports[3821] = "ER_CHECK_CONSTRAINT_NOT_FOUND";
  exports[3822] = "ER_CHECK_CONSTRAINT_DUP_NAME";
  exports[3823] = "ER_CHECK_CONSTRAINT_CLAUSE_USING_FK_REFER_ACTION_COLUMN";
  exports[3824] = "WARN_UNENCRYPTED_TABLE_IN_ENCRYPTED_DB";
  exports[3825] = "ER_INVALID_ENCRYPTION_REQUEST";
  exports[3826] = "ER_CANNOT_SET_TABLE_ENCRYPTION";
  exports[3827] = "ER_CANNOT_SET_DATABASE_ENCRYPTION";
  exports[3828] = "ER_CANNOT_SET_TABLESPACE_ENCRYPTION";
  exports[3829] = "ER_TABLESPACE_CANNOT_BE_ENCRYPTED";
  exports[3830] = "ER_TABLESPACE_CANNOT_BE_DECRYPTED";
  exports[3831] = "ER_TABLESPACE_TYPE_UNKNOWN";
  exports[3832] = "ER_TARGET_TABLESPACE_UNENCRYPTED";
  exports[3833] = "ER_CANNOT_USE_ENCRYPTION_CLAUSE";
  exports[3834] = "ER_INVALID_MULTIPLE_CLAUSES";
  exports[3835] = "ER_UNSUPPORTED_USE_OF_GRANT_AS";
  exports[3836] = "ER_UKNOWN_AUTH_ID_OR_ACCESS_DENIED_FOR_GRANT_AS";
  exports[3837] = "ER_DEPENDENT_BY_FUNCTIONAL_INDEX";
  exports[3838] = "ER_PLUGIN_NOT_EARLY";
  exports[3839] = "ER_INNODB_REDO_LOG_ARCHIVE_START_SUBDIR_PATH";
  exports[3840] = "ER_INNODB_REDO_LOG_ARCHIVE_START_TIMEOUT";
  exports[3841] = "ER_INNODB_REDO_LOG_ARCHIVE_DIRS_INVALID";
  exports[3842] = "ER_INNODB_REDO_LOG_ARCHIVE_LABEL_NOT_FOUND";
  exports[3843] = "ER_INNODB_REDO_LOG_ARCHIVE_DIR_EMPTY";
  exports[3844] = "ER_INNODB_REDO_LOG_ARCHIVE_NO_SUCH_DIR";
  exports[3845] = "ER_INNODB_REDO_LOG_ARCHIVE_DIR_CLASH";
  exports[3846] = "ER_INNODB_REDO_LOG_ARCHIVE_DIR_PERMISSIONS";
  exports[3847] = "ER_INNODB_REDO_LOG_ARCHIVE_FILE_CREATE";
  exports[3848] = "ER_INNODB_REDO_LOG_ARCHIVE_ACTIVE";
  exports[3849] = "ER_INNODB_REDO_LOG_ARCHIVE_INACTIVE";
  exports[3850] = "ER_INNODB_REDO_LOG_ARCHIVE_FAILED";
  exports[3851] = "ER_INNODB_REDO_LOG_ARCHIVE_SESSION";
  exports[3852] = "ER_STD_REGEX_ERROR";
  exports[3853] = "ER_INVALID_JSON_TYPE";
  exports[3854] = "ER_CANNOT_CONVERT_STRING";
  exports[3855] = "ER_DEPENDENT_BY_PARTITION_FUNC";
  exports[3856] = "ER_WARN_DEPRECATED_FLOAT_AUTO_INCREMENT";
  exports[3857] = "ER_RPL_CANT_STOP_REPLICA_WHILE_LOCKED_BACKUP";
  exports[3858] = "ER_WARN_DEPRECATED_FLOAT_DIGITS";
  exports[3859] = "ER_WARN_DEPRECATED_FLOAT_UNSIGNED";
  exports[3860] = "ER_WARN_DEPRECATED_INTEGER_DISPLAY_WIDTH";
  exports[3861] = "ER_WARN_DEPRECATED_ZEROFILL";
  exports[3862] = "ER_CLONE_DONOR";
  exports[3863] = "ER_CLONE_PROTOCOL";
  exports[3864] = "ER_CLONE_DONOR_VERSION";
  exports[3865] = "ER_CLONE_OS";
  exports[3866] = "ER_CLONE_PLATFORM";
  exports[3867] = "ER_CLONE_CHARSET";
  exports[3868] = "ER_CLONE_CONFIG";
  exports[3869] = "ER_CLONE_SYS_CONFIG";
  exports[3870] = "ER_CLONE_PLUGIN_MATCH";
  exports[3871] = "ER_CLONE_LOOPBACK";
  exports[3872] = "ER_CLONE_ENCRYPTION";
  exports[3873] = "ER_CLONE_DISK_SPACE";
  exports[3874] = "ER_CLONE_IN_PROGRESS";
  exports[3875] = "ER_CLONE_DISALLOWED";
  exports[3876] = "ER_CANNOT_GRANT_ROLES_TO_ANONYMOUS_USER";
  exports[3877] = "ER_SECONDARY_ENGINE_PLUGIN";
  exports[3878] = "ER_SECOND_PASSWORD_CANNOT_BE_EMPTY";
  exports[3879] = "ER_DB_ACCESS_DENIED";
  exports[3880] = "ER_DA_AUTH_ID_WITH_SYSTEM_USER_PRIV_IN_MANDATORY_ROLES";
  exports[3881] = "ER_DA_RPL_GTID_TABLE_CANNOT_OPEN";
  exports[3882] = "ER_GEOMETRY_IN_UNKNOWN_LENGTH_UNIT";
  exports[3883] = "ER_DA_PLUGIN_INSTALL_ERROR";
  exports[3884] = "ER_NO_SESSION_TEMP";
  exports[3885] = "ER_DA_UNKNOWN_ERROR_NUMBER";
  exports[3886] = "ER_COLUMN_CHANGE_SIZE";
  exports[3887] = "ER_REGEXP_INVALID_CAPTURE_GROUP_NAME";
  exports[3888] = "ER_DA_SSL_LIBRARY_ERROR";
  exports[3889] = "ER_SECONDARY_ENGINE";
  exports[3890] = "ER_SECONDARY_ENGINE_DDL";
  exports[3891] = "ER_INCORRECT_CURRENT_PASSWORD";
  exports[3892] = "ER_MISSING_CURRENT_PASSWORD";
  exports[3893] = "ER_CURRENT_PASSWORD_NOT_REQUIRED";
  exports[3894] = "ER_PASSWORD_CANNOT_BE_RETAINED_ON_PLUGIN_CHANGE";
  exports[3895] = "ER_CURRENT_PASSWORD_CANNOT_BE_RETAINED";
  exports[3896] = "ER_PARTIAL_REVOKES_EXIST";
  exports[3897] = "ER_CANNOT_GRANT_SYSTEM_PRIV_TO_MANDATORY_ROLE";
  exports[3898] = "ER_XA_REPLICATION_FILTERS";
  exports[3899] = "ER_UNSUPPORTED_SQL_MODE";
  exports[3900] = "ER_REGEXP_INVALID_FLAG";
  exports[3901] = "ER_PARTIAL_REVOKE_AND_DB_GRANT_BOTH_EXISTS";
  exports[3902] = "ER_UNIT_NOT_FOUND";
  exports[3903] = "ER_INVALID_JSON_VALUE_FOR_FUNC_INDEX";
  exports[3904] = "ER_JSON_VALUE_OUT_OF_RANGE_FOR_FUNC_INDEX";
  exports[3905] = "ER_EXCEEDED_MV_KEYS_NUM";
  exports[3906] = "ER_EXCEEDED_MV_KEYS_SPACE";
  exports[3907] = "ER_FUNCTIONAL_INDEX_DATA_IS_TOO_LONG";
  exports[3908] = "ER_WRONG_MVI_VALUE";
  exports[3909] = "ER_WARN_FUNC_INDEX_NOT_APPLICABLE";
  exports[3910] = "ER_GRP_RPL_UDF_ERROR";
  exports[3911] = "ER_UPDATE_GTID_PURGED_WITH_GR";
  exports[3912] = "ER_GROUPING_ON_TIMESTAMP_IN_DST";
  exports[3913] = "ER_TABLE_NAME_CAUSES_TOO_LONG_PATH";
  exports[3914] = "ER_AUDIT_LOG_INSUFFICIENT_PRIVILEGE";
  exports[3915] = "ER_AUDIT_LOG_PASSWORD_HAS_BEEN_COPIED";
  exports[3916] = "ER_DA_GRP_RPL_STARTED_AUTO_REJOIN";
  exports[3917] = "ER_SYSVAR_CHANGE_DURING_QUERY";
  exports[3918] = "ER_GLOBSTAT_CHANGE_DURING_QUERY";
  exports[3919] = "ER_GRP_RPL_MESSAGE_SERVICE_INIT_FAILURE";
  exports[3920] = "ER_CHANGE_SOURCE_WRONG_COMPRESSION_ALGORITHM_CLIENT";
  exports[3921] = "ER_CHANGE_SOURCE_WRONG_COMPRESSION_LEVEL_CLIENT";
  exports[3922] = "ER_WRONG_COMPRESSION_ALGORITHM_CLIENT";
  exports[3923] = "ER_WRONG_COMPRESSION_LEVEL_CLIENT";
  exports[3924] = "ER_CHANGE_SOURCE_WRONG_COMPRESSION_ALGORITHM_LIST_CLIENT";
  exports[3925] = "ER_CLIENT_PRIVILEGE_CHECKS_USER_CANNOT_BE_ANONYMOUS";
  exports[3926] = "ER_CLIENT_PRIVILEGE_CHECKS_USER_DOES_NOT_EXIST";
  exports[3927] = "ER_CLIENT_PRIVILEGE_CHECKS_USER_CORRUPT";
  exports[3928] = "ER_CLIENT_PRIVILEGE_CHECKS_USER_NEEDS_RPL_APPLIER_PRIV";
  exports[3929] = "ER_WARN_DA_PRIVILEGE_NOT_REGISTERED";
  exports[3930] = "ER_CLIENT_KEYRING_UDF_KEY_INVALID";
  exports[3931] = "ER_CLIENT_KEYRING_UDF_KEY_TYPE_INVALID";
  exports[3932] = "ER_CLIENT_KEYRING_UDF_KEY_TOO_LONG";
  exports[3933] = "ER_CLIENT_KEYRING_UDF_KEY_TYPE_TOO_LONG";
  exports[3934] = "ER_JSON_SCHEMA_VALIDATION_ERROR_WITH_DETAILED_REPORT";
  exports[3935] = "ER_DA_UDF_INVALID_CHARSET_SPECIFIED";
  exports[3936] = "ER_DA_UDF_INVALID_CHARSET";
  exports[3937] = "ER_DA_UDF_INVALID_COLLATION";
  exports[3938] = "ER_DA_UDF_INVALID_EXTENSION_ARGUMENT_TYPE";
  exports[3939] = "ER_MULTIPLE_CONSTRAINTS_WITH_SAME_NAME";
  exports[3940] = "ER_CONSTRAINT_NOT_FOUND";
  exports[3941] = "ER_ALTER_CONSTRAINT_ENFORCEMENT_NOT_SUPPORTED";
  exports[3942] = "ER_TABLE_VALUE_CONSTRUCTOR_MUST_HAVE_COLUMNS";
  exports[3943] = "ER_TABLE_VALUE_CONSTRUCTOR_CANNOT_HAVE_DEFAULT";
  exports[3944] = "ER_CLIENT_QUERY_FAILURE_INVALID_NON_ROW_FORMAT";
  exports[3945] = "ER_REQUIRE_ROW_FORMAT_INVALID_VALUE";
  exports[3946] = "ER_FAILED_TO_DETERMINE_IF_ROLE_IS_MANDATORY";
  exports[3947] = "ER_FAILED_TO_FETCH_MANDATORY_ROLE_LIST";
  exports[3948] = "ER_CLIENT_LOCAL_FILES_DISABLED";
  exports[3949] = "ER_IMP_INCOMPATIBLE_CFG_VERSION";
  exports[3950] = "ER_DA_OOM";
  exports[3951] = "ER_DA_UDF_INVALID_ARGUMENT_TO_SET_CHARSET";
  exports[3952] = "ER_DA_UDF_INVALID_RETURN_TYPE_TO_SET_CHARSET";
  exports[3953] = "ER_MULTIPLE_INTO_CLAUSES";
  exports[3954] = "ER_MISPLACED_INTO";
  exports[3955] = "ER_USER_ACCESS_DENIED_FOR_USER_ACCOUNT_BLOCKED_BY_PASSWORD_LOCK";
  exports[3956] = "ER_WARN_DEPRECATED_YEAR_UNSIGNED";
  exports[3957] = "ER_CLONE_NETWORK_PACKET";
  exports[3958] = "ER_SDI_OPERATION_FAILED_MISSING_RECORD";
  exports[3959] = "ER_DEPENDENT_BY_CHECK_CONSTRAINT";
  exports[3960] = "ER_GRP_OPERATION_NOT_ALLOWED_GR_MUST_STOP";
  exports[3961] = "ER_WARN_DEPRECATED_JSON_TABLE_ON_ERROR_ON_EMPTY";
  exports[3962] = "ER_WARN_DEPRECATED_INNER_INTO";
  exports[3963] = "ER_WARN_DEPRECATED_VALUES_FUNCTION_ALWAYS_NULL";
  exports[3964] = "ER_WARN_DEPRECATED_SQL_CALC_FOUND_ROWS";
  exports[3965] = "ER_WARN_DEPRECATED_FOUND_ROWS";
  exports[3966] = "ER_MISSING_JSON_VALUE";
  exports[3967] = "ER_MULTIPLE_JSON_VALUES";
  exports[3968] = "ER_HOSTNAME_TOO_LONG";
  exports[3969] = "ER_WARN_CLIENT_DEPRECATED_PARTITION_PREFIX_KEY";
  exports[3970] = "ER_GROUP_REPLICATION_USER_EMPTY_MSG";
  exports[3971] = "ER_GROUP_REPLICATION_USER_MANDATORY_MSG";
  exports[3972] = "ER_GROUP_REPLICATION_PASSWORD_LENGTH";
  exports[3973] = "ER_SUBQUERY_TRANSFORM_REJECTED";
  exports[3974] = "ER_DA_GRP_RPL_RECOVERY_ENDPOINT_FORMAT";
  exports[3975] = "ER_DA_GRP_RPL_RECOVERY_ENDPOINT_INVALID";
  exports[3976] = "ER_WRONG_VALUE_FOR_VAR_PLUS_ACTIONABLE_PART";
  exports[3977] = "ER_STATEMENT_NOT_ALLOWED_AFTER_START_TRANSACTION";
  exports[3978] = "ER_FOREIGN_KEY_WITH_ATOMIC_CREATE_SELECT";
  exports[3979] = "ER_NOT_ALLOWED_WITH_START_TRANSACTION";
  exports[3980] = "ER_INVALID_JSON_ATTRIBUTE";
  exports[3981] = "ER_ENGINE_ATTRIBUTE_NOT_SUPPORTED";
  exports[3982] = "ER_INVALID_USER_ATTRIBUTE_JSON";
  exports[3983] = "ER_INNODB_REDO_DISABLED";
  exports[3984] = "ER_INNODB_REDO_ARCHIVING_ENABLED";
  exports[3985] = "ER_MDL_OUT_OF_RESOURCES";
  exports[3986] = "ER_IMPLICIT_COMPARISON_FOR_JSON";
  exports[3987] = "ER_FUNCTION_DOES_NOT_SUPPORT_CHARACTER_SET";
  exports[3988] = "ER_IMPOSSIBLE_STRING_CONVERSION";
  exports[3989] = "ER_SCHEMA_READ_ONLY";
  exports[3990] = "ER_RPL_ASYNC_RECONNECT_GTID_MODE_OFF";
  exports[3991] = "ER_RPL_ASYNC_RECONNECT_AUTO_POSITION_OFF";
  exports[3992] = "ER_DISABLE_GTID_MODE_REQUIRES_ASYNC_RECONNECT_OFF";
  exports[3993] = "ER_DISABLE_AUTO_POSITION_REQUIRES_ASYNC_RECONNECT_OFF";
  exports[3994] = "ER_INVALID_PARAMETER_USE";
  exports[3995] = "ER_CHARACTER_SET_MISMATCH";
  exports[3996] = "ER_WARN_VAR_VALUE_CHANGE_NOT_SUPPORTED";
  exports[3997] = "ER_INVALID_TIME_ZONE_INTERVAL";
  exports[3998] = "ER_INVALID_CAST";
  exports[3999] = "ER_HYPERGRAPH_NOT_SUPPORTED_YET";
  exports[4e3] = "ER_WARN_HYPERGRAPH_EXPERIMENTAL";
  exports[4001] = "ER_DA_NO_ERROR_LOG_PARSER_CONFIGURED";
  exports[4002] = "ER_DA_ERROR_LOG_TABLE_DISABLED";
  exports[4003] = "ER_DA_ERROR_LOG_MULTIPLE_FILTERS";
  exports[4004] = "ER_DA_CANT_OPEN_ERROR_LOG";
  exports[4005] = "ER_USER_REFERENCED_AS_DEFINER";
  exports[4006] = "ER_CANNOT_USER_REFERENCED_AS_DEFINER";
  exports[4007] = "ER_REGEX_NUMBER_TOO_BIG";
  exports[4008] = "ER_SPVAR_NONINTEGER_TYPE";
  exports[4009] = "WARN_UNSUPPORTED_ACL_TABLES_READ";
  exports[4010] = "ER_BINLOG_UNSAFE_ACL_TABLE_READ_IN_DML_DDL";
  exports[4011] = "ER_STOP_REPLICA_MONITOR_IO_THREAD_TIMEOUT";
  exports[4012] = "ER_STARTING_REPLICA_MONITOR_IO_THREAD";
  exports[4013] = "ER_CANT_USE_ANONYMOUS_TO_GTID_WITH_GTID_MODE_NOT_ON";
  exports[4014] = "ER_CANT_COMBINE_ANONYMOUS_TO_GTID_AND_AUTOPOSITION";
  exports[4015] = "ER_ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS_REQUIRES_GTID_MODE_ON";
  exports[4016] = "ER_SQL_REPLICA_SKIP_COUNTER_USED_WITH_GTID_MODE_ON";
  exports[4017] = "ER_USING_ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS_AS_LOCAL_OR_UUID";
  exports[4018] = "ER_CANT_SET_ANONYMOUS_TO_GTID_AND_WAIT_UNTIL_SQL_THD_AFTER_GTIDS";
  exports[4019] = "ER_CANT_SET_SQL_AFTER_OR_BEFORE_GTIDS_WITH_ANONYMOUS_TO_GTID";
  exports[4020] = "ER_ANONYMOUS_TO_GTID_UUID_SAME_AS_GROUP_NAME";
  exports[4021] = "ER_CANT_USE_SAME_UUID_AS_GROUP_NAME";
  exports[4022] = "ER_GRP_RPL_RECOVERY_CHANNEL_STILL_RUNNING";
  exports[4023] = "ER_INNODB_INVALID_AUTOEXTEND_SIZE_VALUE";
  exports[4024] = "ER_INNODB_INCOMPATIBLE_WITH_TABLESPACE";
  exports[4025] = "ER_INNODB_AUTOEXTEND_SIZE_OUT_OF_RANGE";
  exports[4026] = "ER_CANNOT_USE_AUTOEXTEND_SIZE_CLAUSE";
  exports[4027] = "ER_ROLE_GRANTED_TO_ITSELF";
  exports[4028] = "ER_TABLE_MUST_HAVE_A_VISIBLE_COLUMN";
  exports[4029] = "ER_INNODB_COMPRESSION_FAILURE";
  exports[4030] = "ER_WARN_ASYNC_CONN_FAILOVER_NETWORK_NAMESPACE";
  exports[4031] = "ER_CLIENT_INTERACTION_TIMEOUT";
  exports[4032] = "ER_INVALID_CAST_TO_GEOMETRY";
  exports[4033] = "ER_INVALID_CAST_POLYGON_RING_DIRECTION";
  exports[4034] = "ER_GIS_DIFFERENT_SRIDS_AGGREGATION";
  exports[4035] = "ER_RELOAD_KEYRING_FAILURE";
  exports[4036] = "ER_SDI_GET_KEYS_INVALID_TABLESPACE";
  exports[4037] = "ER_CHANGE_RPL_SRC_WRONG_COMPRESSION_ALGORITHM_SIZE";
  exports[4038] = "ER_WARN_DEPRECATED_TLS_VERSION_FOR_CHANNEL_CLI";
  exports[4039] = "ER_CANT_USE_SAME_UUID_AS_VIEW_CHANGE_UUID";
  exports[4040] = "ER_ANONYMOUS_TO_GTID_UUID_SAME_AS_VIEW_CHANGE_UUID";
  exports[4041] = "ER_GRP_RPL_VIEW_CHANGE_UUID_FAIL_GET_VARIABLE";
  exports[4042] = "ER_WARN_ADUIT_LOG_MAX_SIZE_AND_PRUNE_SECONDS";
  exports[4043] = "ER_WARN_ADUIT_LOG_MAX_SIZE_CLOSE_TO_ROTATE_ON_SIZE";
  exports[4044] = "ER_KERBEROS_CREATE_USER";
  exports[4045] = "ER_INSTALL_PLUGIN_CONFLICT_CLIENT";
  exports[4046] = "ER_DA_ERROR_LOG_COMPONENT_FLUSH_FAILED";
  exports[4047] = "ER_WARN_SQL_AFTER_MTS_GAPS_GAP_NOT_CALCULATED";
  exports[4048] = "ER_INVALID_ASSIGNMENT_TARGET";
  exports[4049] = "ER_OPERATION_NOT_ALLOWED_ON_GR_SECONDARY";
  exports[4050] = "ER_GRP_RPL_FAILOVER_CHANNEL_STATUS_PROPAGATION";
  exports[4051] = "ER_WARN_AUDIT_LOG_FORMAT_UNIX_TIMESTAMP_ONLY_WHEN_JSON";
  exports[4052] = "ER_INVALID_MFA_PLUGIN_SPECIFIED";
  exports[4053] = "ER_IDENTIFIED_BY_UNSUPPORTED";
  exports[4054] = "ER_INVALID_PLUGIN_FOR_REGISTRATION";
  exports[4055] = "ER_PLUGIN_REQUIRES_REGISTRATION";
  exports[4056] = "ER_MFA_METHOD_EXISTS";
  exports[4057] = "ER_MFA_METHOD_NOT_EXISTS";
  exports[4058] = "ER_AUTHENTICATION_POLICY_MISMATCH";
  exports[4059] = "ER_PLUGIN_REGISTRATION_DONE";
  exports[4060] = "ER_INVALID_USER_FOR_REGISTRATION";
  exports[4061] = "ER_USER_REGISTRATION_FAILED";
  exports[4062] = "ER_MFA_METHODS_INVALID_ORDER";
  exports[4063] = "ER_MFA_METHODS_IDENTICAL";
  exports[4064] = "ER_INVALID_MFA_OPERATIONS_FOR_PASSWORDLESS_USER";
  exports[4065] = "ER_CHANGE_REPLICATION_SOURCE_NO_OPTIONS_FOR_GTID_ONLY";
  exports[4066] = "ER_CHANGE_REP_SOURCE_CANT_DISABLE_REQ_ROW_FORMAT_WITH_GTID_ONLY";
  exports[4067] = "ER_CHANGE_REP_SOURCE_CANT_DISABLE_AUTO_POSITION_WITH_GTID_ONLY";
  exports[4068] = "ER_CHANGE_REP_SOURCE_CANT_DISABLE_GTID_ONLY_WITHOUT_POSITIONS";
  exports[4069] = "ER_CHANGE_REP_SOURCE_CANT_DISABLE_AUTO_POS_WITHOUT_POSITIONS";
  exports[4070] = "ER_CHANGE_REP_SOURCE_GR_CHANNEL_WITH_GTID_MODE_NOT_ON";
  exports[4071] = "ER_CANT_USE_GTID_ONLY_WITH_GTID_MODE_NOT_ON";
  exports[4072] = "ER_WARN_C_DISABLE_GTID_ONLY_WITH_SOURCE_AUTO_POS_INVALID_POS";
  exports[4073] = "ER_DA_SSL_FIPS_MODE_ERROR";
  exports[4074] = "ER_VALUE_OUT_OF_RANGE";
  exports[4075] = "ER_FULLTEXT_WITH_ROLLUP";
  exports[4076] = "ER_REGEXP_MISSING_RESOURCE";
  exports[4077] = "ER_WARN_REGEXP_USING_DEFAULT";
  exports[4078] = "ER_REGEXP_MISSING_FILE";
  exports[4079] = "ER_WARN_DEPRECATED_COLLATION";
  exports[4080] = "ER_CONCURRENT_PROCEDURE_USAGE";
  exports[4081] = "ER_DA_GLOBAL_CONN_LIMIT";
  exports[4082] = "ER_DA_CONN_LIMIT";
  exports[4083] = "ER_ALTER_OPERATION_NOT_SUPPORTED_REASON_COLUMN_TYPE_INSTANT";
  exports[4084] = "ER_WARN_SF_UDF_NAME_COLLISION";
  exports[4085] = "ER_CANNOT_PURGE_BINLOG_WITH_BACKUP_LOCK";
  exports[4086] = "ER_TOO_MANY_WINDOWS";
  exports[4087] = "ER_MYSQLBACKUP_CLIENT_MSG";
  exports[4088] = "ER_COMMENT_CONTAINS_INVALID_STRING";
  exports[4089] = "ER_DEFINITION_CONTAINS_INVALID_STRING";
  exports[4090] = "ER_CANT_EXECUTE_COMMAND_WITH_ASSIGNED_GTID_NEXT";
  exports[4091] = "ER_XA_TEMP_TABLE";
  exports[4092] = "ER_INNODB_MAX_ROW_VERSION";
  exports[4093] = "ER_INNODB_INSTANT_ADD_NOT_SUPPORTED_MAX_SIZE";
  exports[4094] = "ER_OPERATION_NOT_ALLOWED_WHILE_PRIMARY_CHANGE_IS_RUNNING";
  exports[4095] = "ER_WARN_DEPRECATED_DATETIME_DELIMITER";
  exports[4096] = "ER_WARN_DEPRECATED_SUPERFLUOUS_DELIMITER";
  exports[4097] = "ER_CANNOT_PERSIST_SENSITIVE_VARIABLES";
  exports[4098] = "ER_WARN_CANNOT_SECURELY_PERSIST_SENSITIVE_VARIABLES";
  exports[4099] = "ER_WARN_TRG_ALREADY_EXISTS";
  exports[4100] = "ER_IF_NOT_EXISTS_UNSUPPORTED_TRG_EXISTS_ON_DIFFERENT_TABLE";
  exports[4101] = "ER_IF_NOT_EXISTS_UNSUPPORTED_UDF_NATIVE_FCT_NAME_COLLISION";
  exports[4102] = "ER_SET_PASSWORD_AUTH_PLUGIN_ERROR";
  exports[4103] = "ER_REDUCED_DBLWR_FILE_CORRUPTED";
  exports[4104] = "ER_REDUCED_DBLWR_PAGE_FOUND";
  exports[4105] = "ER_SRS_INVALID_LATITUDE_OF_ORIGIN";
  exports[4106] = "ER_SRS_INVALID_LONGITUDE_OF_ORIGIN";
  exports[4107] = "ER_SRS_UNUSED_PROJ_PARAMETER_PRESENT";
  exports[4108] = "ER_GIPK_COLUMN_EXISTS";
  exports[4109] = "ER_GIPK_FAILED_AUTOINC_COLUMN_EXISTS";
  exports[4110] = "ER_GIPK_COLUMN_ALTER_NOT_ALLOWED";
  exports[4111] = "ER_DROP_PK_COLUMN_TO_DROP_GIPK";
  exports[4112] = "ER_CREATE_SELECT_WITH_GIPK_DISALLOWED_IN_SBR";
  exports[4113] = "ER_DA_EXPIRE_LOGS_DAYS_IGNORED";
  exports[4114] = "ER_CTE_RECURSIVE_NOT_UNION";
  exports[4115] = "ER_COMMAND_BACKEND_FAILED_TO_FETCH_SECURITY_CTX";
  exports[4116] = "ER_COMMAND_SERVICE_BACKEND_FAILED";
  exports[4117] = "ER_CLIENT_FILE_PRIVILEGE_FOR_REPLICATION_CHECKS";
  exports[4118] = "ER_GROUP_REPLICATION_FORCE_MEMBERS_COMMAND_FAILURE";
  exports[4119] = "ER_WARN_DEPRECATED_IDENT";
  exports[4120] = "ER_INTERSECT_ALL_MAX_DUPLICATES_EXCEEDED";
  exports[4121] = "ER_TP_QUERY_THRS_PER_GRP_EXCEEDS_TXN_THR_LIMIT";
  exports[4122] = "ER_BAD_TIMESTAMP_FORMAT";
  exports[4123] = "ER_SHAPE_PRIDICTION_UDF";
  exports[4124] = "ER_SRS_INVALID_HEIGHT";
  exports[4125] = "ER_SRS_INVALID_SCALING";
  exports[4126] = "ER_SRS_INVALID_ZONE_WIDTH";
  exports[4127] = "ER_SRS_INVALID_LATITUDE_POLAR_STERE_VAR_A";
  exports[4128] = "ER_WARN_DEPRECATED_CLIENT_NO_SCHEMA_OPTION";
  exports[4129] = "ER_TABLE_NOT_EMPTY";
  exports[4130] = "ER_TABLE_NO_PRIMARY_KEY";
  exports[4131] = "ER_TABLE_IN_SHARED_TABLESPACE";
  exports[4132] = "ER_INDEX_OTHER_THAN_PK";
  exports[4133] = "ER_LOAD_BULK_DATA_UNSORTED";
  exports[4134] = "ER_BULK_EXECUTOR_ERROR";
  exports[4135] = "ER_BULK_READER_LIBCURL_INIT_FAILED";
  exports[4136] = "ER_BULK_READER_LIBCURL_ERROR";
  exports[4137] = "ER_BULK_READER_SERVER_ERROR";
  exports[4138] = "ER_BULK_READER_COMMUNICATION_ERROR";
  exports[4139] = "ER_BULK_LOAD_DATA_FAILED";
  exports[4140] = "ER_BULK_LOADER_COLUMN_TOO_BIG_FOR_LEFTOVER_BUFFER";
  exports[4141] = "ER_BULK_LOADER_COMPONENT_ERROR";
  exports[4142] = "ER_BULK_LOADER_FILE_CONTAINS_LESS_LINES_THAN_IGNORE_CLAUSE";
  exports[4143] = "ER_BULK_PARSER_MISSING_ENCLOSED_BY";
  exports[4144] = "ER_BULK_PARSER_ROW_BUFFER_MAX_TOTAL_COLS_EXCEEDED";
  exports[4145] = "ER_BULK_PARSER_COPY_BUFFER_SIZE_EXCEEDED";
  exports[4146] = "ER_BULK_PARSER_UNEXPECTED_END_OF_INPUT";
  exports[4147] = "ER_BULK_PARSER_UNEXPECTED_ROW_TERMINATOR";
  exports[4148] = "ER_BULK_PARSER_UNEXPECTED_CHAR_AFTER_ENDING_ENCLOSED_BY";
  exports[4149] = "ER_BULK_PARSER_UNEXPECTED_CHAR_AFTER_NULL_ESCAPE";
  exports[4150] = "ER_BULK_PARSER_UNEXPECTED_CHAR_AFTER_COLUMN_TERMINATOR";
  exports[4151] = "ER_BULK_PARSER_INCOMPLETE_ESCAPE_SEQUENCE";
  exports[4152] = "ER_LOAD_BULK_DATA_FAILED";
  exports[4153] = "ER_LOAD_BULK_DATA_WRONG_VALUE_FOR_FIELD";
  exports[4154] = "ER_LOAD_BULK_DATA_WARN_NULL_TO_NOTNULL";
  exports[4155] = "ER_REQUIRE_TABLE_PRIMARY_KEY_CHECK_GENERATE_WITH_GR";
  exports[4156] = "ER_CANT_CHANGE_SYS_VAR_IN_READ_ONLY_MODE";
  exports[4157] = "ER_INNODB_INSTANT_ADD_DROP_NOT_SUPPORTED_MAX_SIZE";
  exports[4158] = "ER_INNODB_INSTANT_ADD_NOT_SUPPORTED_MAX_FIELDS";
  exports[4159] = "ER_CANT_SET_PERSISTED";
  exports[4160] = "ER_INSTALL_COMPONENT_SET_NULL_VALUE";
  exports[4161] = "ER_INSTALL_COMPONENT_SET_UNUSED_VALUE";
  exports[4162] = "ER_WARN_DEPRECATED_USER_DEFINED_COLLATIONS";
})(errors);
var umd = { exports: {} };
(function(module, exports) {
  (function(global, factory) {
    function preferDefault(exports2) {
      return exports2.default || exports2;
    }
    {
      factory(exports);
      module.exports = preferDefault(exports);
    }
  })(
    typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : commonjsGlobal,
    function(_exports) {
      Object.defineProperty(_exports, "__esModule", {
        value: true
      });
      _exports.default = void 0;
      /**
       * @license
       * Copyright 2009 The Closure Library Authors
       * Copyright 2020 Daniel Wirtz / The long.js Authors.
       *
       * Licensed under the Apache License, Version 2.0 (the "License");
       * you may not use this file except in compliance with the License.
       * You may obtain a copy of the License at
       *
       *     http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an "AS IS" BASIS,
       * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
       * See the License for the specific language governing permissions and
       * limitations under the License.
       *
       * SPDX-License-Identifier: Apache-2.0
       */
      var wasm = null;
      try {
        wasm = new WebAssembly.Instance(
          new WebAssembly.Module(
            new Uint8Array([
              // \0asm
              0,
              97,
              115,
              109,
              // version 1
              1,
              0,
              0,
              0,
              // section "type"
              1,
              13,
              2,
              // 0, () => i32
              96,
              0,
              1,
              127,
              // 1, (i32, i32, i32, i32) => i32
              96,
              4,
              127,
              127,
              127,
              127,
              1,
              127,
              // section "function"
              3,
              7,
              6,
              // 0, type 0
              0,
              // 1, type 1
              1,
              // 2, type 1
              1,
              // 3, type 1
              1,
              // 4, type 1
              1,
              // 5, type 1
              1,
              // section "global"
              6,
              6,
              1,
              // 0, "high", mutable i32
              127,
              1,
              65,
              0,
              11,
              // section "export"
              7,
              50,
              6,
              // 0, "mul"
              3,
              109,
              117,
              108,
              0,
              1,
              // 1, "div_s"
              5,
              100,
              105,
              118,
              95,
              115,
              0,
              2,
              // 2, "div_u"
              5,
              100,
              105,
              118,
              95,
              117,
              0,
              3,
              // 3, "rem_s"
              5,
              114,
              101,
              109,
              95,
              115,
              0,
              4,
              // 4, "rem_u"
              5,
              114,
              101,
              109,
              95,
              117,
              0,
              5,
              // 5, "get_high"
              8,
              103,
              101,
              116,
              95,
              104,
              105,
              103,
              104,
              0,
              0,
              // section "code"
              10,
              191,
              1,
              6,
              // 0, "get_high"
              4,
              0,
              35,
              0,
              11,
              // 1, "mul"
              36,
              1,
              1,
              126,
              32,
              0,
              173,
              32,
              1,
              173,
              66,
              32,
              134,
              132,
              32,
              2,
              173,
              32,
              3,
              173,
              66,
              32,
              134,
              132,
              126,
              34,
              4,
              66,
              32,
              135,
              167,
              36,
              0,
              32,
              4,
              167,
              11,
              // 2, "div_s"
              36,
              1,
              1,
              126,
              32,
              0,
              173,
              32,
              1,
              173,
              66,
              32,
              134,
              132,
              32,
              2,
              173,
              32,
              3,
              173,
              66,
              32,
              134,
              132,
              127,
              34,
              4,
              66,
              32,
              135,
              167,
              36,
              0,
              32,
              4,
              167,
              11,
              // 3, "div_u"
              36,
              1,
              1,
              126,
              32,
              0,
              173,
              32,
              1,
              173,
              66,
              32,
              134,
              132,
              32,
              2,
              173,
              32,
              3,
              173,
              66,
              32,
              134,
              132,
              128,
              34,
              4,
              66,
              32,
              135,
              167,
              36,
              0,
              32,
              4,
              167,
              11,
              // 4, "rem_s"
              36,
              1,
              1,
              126,
              32,
              0,
              173,
              32,
              1,
              173,
              66,
              32,
              134,
              132,
              32,
              2,
              173,
              32,
              3,
              173,
              66,
              32,
              134,
              132,
              129,
              34,
              4,
              66,
              32,
              135,
              167,
              36,
              0,
              32,
              4,
              167,
              11,
              // 5, "rem_u"
              36,
              1,
              1,
              126,
              32,
              0,
              173,
              32,
              1,
              173,
              66,
              32,
              134,
              132,
              32,
              2,
              173,
              32,
              3,
              173,
              66,
              32,
              134,
              132,
              130,
              34,
              4,
              66,
              32,
              135,
              167,
              36,
              0,
              32,
              4,
              167,
              11
            ])
          ),
          {}
        ).exports;
      } catch {
      }
      function Long2(low, high, unsigned) {
        this.low = low | 0;
        this.high = high | 0;
        this.unsigned = !!unsigned;
      }
      Long2.prototype.__isLong__;
      Object.defineProperty(Long2.prototype, "__isLong__", {
        value: true
      });
      function isLong(obj) {
        return (obj && obj["__isLong__"]) === true;
      }
      function ctz32(value) {
        var c = Math.clz32(value & -value);
        return value ? 31 - c : c;
      }
      Long2.isLong = isLong;
      var INT_CACHE = {};
      var UINT_CACHE = {};
      function fromInt(value, unsigned) {
        var obj, cachedObj, cache;
        if (unsigned) {
          value >>>= 0;
          if (cache = 0 <= value && value < 256) {
            cachedObj = UINT_CACHE[value];
            if (cachedObj) return cachedObj;
          }
          obj = fromBits(value, 0, true);
          if (cache) UINT_CACHE[value] = obj;
          return obj;
        } else {
          value |= 0;
          if (cache = -128 <= value && value < 128) {
            cachedObj = INT_CACHE[value];
            if (cachedObj) return cachedObj;
          }
          obj = fromBits(value, value < 0 ? -1 : 0, false);
          if (cache) INT_CACHE[value] = obj;
          return obj;
        }
      }
      Long2.fromInt = fromInt;
      function fromNumber(value, unsigned) {
        if (isNaN(value)) return unsigned ? UZERO : ZERO;
        if (unsigned) {
          if (value < 0) return UZERO;
          if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
        } else {
          if (value <= -9223372036854776e3) return MIN_VALUE;
          if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
        }
        if (value < 0) return fromNumber(-value, unsigned).neg();
        return fromBits(
          value % TWO_PWR_32_DBL | 0,
          value / TWO_PWR_32_DBL | 0,
          unsigned
        );
      }
      Long2.fromNumber = fromNumber;
      function fromBits(lowBits, highBits, unsigned) {
        return new Long2(lowBits, highBits, unsigned);
      }
      Long2.fromBits = fromBits;
      var pow_dbl = Math.pow;
      function fromString(str, unsigned, radix) {
        if (str.length === 0) throw Error("empty string");
        if (typeof unsigned === "number") {
          radix = unsigned;
          unsigned = false;
        } else {
          unsigned = !!unsigned;
        }
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
          return unsigned ? UZERO : ZERO;
        radix = radix || 10;
        if (radix < 2 || 36 < radix) throw RangeError("radix");
        var p;
        if ((p = str.indexOf("-")) > 0) throw Error("interior hyphen");
        else if (p === 0) {
          return fromString(str.substring(1), unsigned, radix).neg();
        }
        var radixToPower = fromNumber(pow_dbl(radix, 8));
        var result = ZERO;
        for (var i = 0; i < str.length; i += 8) {
          var size2 = Math.min(8, str.length - i), value = parseInt(str.substring(i, i + size2), radix);
          if (size2 < 8) {
            var power = fromNumber(pow_dbl(radix, size2));
            result = result.mul(power).add(fromNumber(value));
          } else {
            result = result.mul(radixToPower);
            result = result.add(fromNumber(value));
          }
        }
        result.unsigned = unsigned;
        return result;
      }
      Long2.fromString = fromString;
      function fromValue(val, unsigned) {
        if (typeof val === "number") return fromNumber(val, unsigned);
        if (typeof val === "string") return fromString(val, unsigned);
        return fromBits(
          val.low,
          val.high,
          typeof unsigned === "boolean" ? unsigned : val.unsigned
        );
      }
      Long2.fromValue = fromValue;
      var TWO_PWR_16_DBL = 1 << 16;
      var TWO_PWR_24_DBL = 1 << 24;
      var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
      var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
      var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
      var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
      var ZERO = fromInt(0);
      Long2.ZERO = ZERO;
      var UZERO = fromInt(0, true);
      Long2.UZERO = UZERO;
      var ONE = fromInt(1);
      Long2.ONE = ONE;
      var UONE = fromInt(1, true);
      Long2.UONE = UONE;
      var NEG_ONE = fromInt(-1);
      Long2.NEG_ONE = NEG_ONE;
      var MAX_VALUE = fromBits(4294967295 | 0, 2147483647 | 0, false);
      Long2.MAX_VALUE = MAX_VALUE;
      var MAX_UNSIGNED_VALUE = fromBits(4294967295 | 0, 4294967295 | 0, true);
      Long2.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
      var MIN_VALUE = fromBits(0, 2147483648 | 0, false);
      Long2.MIN_VALUE = MIN_VALUE;
      var LongPrototype = Long2.prototype;
      LongPrototype.toInt = function toInt() {
        return this.unsigned ? this.low >>> 0 : this.low;
      };
      LongPrototype.toNumber = function toNumber() {
        if (this.unsigned)
          return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
      };
      LongPrototype.toString = function toString(radix) {
        radix = radix || 10;
        if (radix < 2 || 36 < radix) throw RangeError("radix");
        if (this.isZero()) return "0";
        if (this.isNegative()) {
          if (this.eq(MIN_VALUE)) {
            var radixLong = fromNumber(radix), div = this.div(radixLong), rem1 = div.mul(radixLong).sub(this);
            return div.toString(radix) + rem1.toInt().toString(radix);
          } else return "-" + this.neg().toString(radix);
        }
        var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned), rem = this;
        var result = "";
        while (true) {
          var remDiv = rem.div(radixToPower), intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0, digits = intval.toString(radix);
          rem = remDiv;
          if (rem.isZero()) return digits + result;
          else {
            while (digits.length < 6) digits = "0" + digits;
            result = "" + digits + result;
          }
        }
      };
      LongPrototype.getHighBits = function getHighBits() {
        return this.high;
      };
      LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
        return this.high >>> 0;
      };
      LongPrototype.getLowBits = function getLowBits() {
        return this.low;
      };
      LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
        return this.low >>> 0;
      };
      LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
        if (this.isNegative())
          return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
        return this.high != 0 ? bit + 33 : bit + 1;
      };
      LongPrototype.isSafeInteger = function isSafeInteger() {
        var top11Bits = this.high >> 21;
        if (!top11Bits) return true;
        if (this.unsigned) return false;
        return top11Bits === -1 && !(this.low === 0 && this.high === -2097152);
      };
      LongPrototype.isZero = function isZero() {
        return this.high === 0 && this.low === 0;
      };
      LongPrototype.eqz = LongPrototype.isZero;
      LongPrototype.isNegative = function isNegative() {
        return !this.unsigned && this.high < 0;
      };
      LongPrototype.isPositive = function isPositive() {
        return this.unsigned || this.high >= 0;
      };
      LongPrototype.isOdd = function isOdd() {
        return (this.low & 1) === 1;
      };
      LongPrototype.isEven = function isEven() {
        return (this.low & 1) === 0;
      };
      LongPrototype.equals = function equals(other) {
        if (!isLong(other)) other = fromValue(other);
        if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1)
          return false;
        return this.high === other.high && this.low === other.low;
      };
      LongPrototype.eq = LongPrototype.equals;
      LongPrototype.notEquals = function notEquals(other) {
        return !this.eq(
          /* validates */
          other
        );
      };
      LongPrototype.neq = LongPrototype.notEquals;
      LongPrototype.ne = LongPrototype.notEquals;
      LongPrototype.lessThan = function lessThan(other) {
        return this.comp(
          /* validates */
          other
        ) < 0;
      };
      LongPrototype.lt = LongPrototype.lessThan;
      LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
        return this.comp(
          /* validates */
          other
        ) <= 0;
      };
      LongPrototype.lte = LongPrototype.lessThanOrEqual;
      LongPrototype.le = LongPrototype.lessThanOrEqual;
      LongPrototype.greaterThan = function greaterThan(other) {
        return this.comp(
          /* validates */
          other
        ) > 0;
      };
      LongPrototype.gt = LongPrototype.greaterThan;
      LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
        return this.comp(
          /* validates */
          other
        ) >= 0;
      };
      LongPrototype.gte = LongPrototype.greaterThanOrEqual;
      LongPrototype.ge = LongPrototype.greaterThanOrEqual;
      LongPrototype.compare = function compare(other) {
        if (!isLong(other)) other = fromValue(other);
        if (this.eq(other)) return 0;
        var thisNeg = this.isNegative(), otherNeg = other.isNegative();
        if (thisNeg && !otherNeg) return -1;
        if (!thisNeg && otherNeg) return 1;
        if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1;
        return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
      };
      LongPrototype.comp = LongPrototype.compare;
      LongPrototype.negate = function negate() {
        if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
        return this.not().add(ONE);
      };
      LongPrototype.neg = LongPrototype.negate;
      LongPrototype.add = function add(addend) {
        if (!isLong(addend)) addend = fromValue(addend);
        var a48 = this.high >>> 16;
        var a32 = this.high & 65535;
        var a16 = this.low >>> 16;
        var a00 = this.low & 65535;
        var b48 = addend.high >>> 16;
        var b32 = addend.high & 65535;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 65535;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 65535;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 65535;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c48 += a48 + b48;
        c48 &= 65535;
        return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
      };
      LongPrototype.subtract = function subtract(subtrahend) {
        if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
        return this.add(subtrahend.neg());
      };
      LongPrototype.sub = LongPrototype.subtract;
      LongPrototype.multiply = function multiply(multiplier) {
        if (this.isZero()) return this;
        if (!isLong(multiplier)) multiplier = fromValue(multiplier);
        if (wasm) {
          var low = wasm["mul"](
            this.low,
            this.high,
            multiplier.low,
            multiplier.high
          );
          return fromBits(low, wasm["get_high"](), this.unsigned);
        }
        if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
        if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
        if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
        if (this.isNegative()) {
          if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());
          else return this.neg().mul(multiplier).neg();
        } else if (multiplier.isNegative())
          return this.mul(multiplier.neg()).neg();
        if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
          return fromNumber(
            this.toNumber() * multiplier.toNumber(),
            this.unsigned
          );
        var a48 = this.high >>> 16;
        var a32 = this.high & 65535;
        var a16 = this.low >>> 16;
        var a00 = this.low & 65535;
        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 65535;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 65535;
        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 65535;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 65535;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 65535;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 65535;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 65535;
        return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
      };
      LongPrototype.mul = LongPrototype.multiply;
      LongPrototype.divide = function divide(divisor) {
        if (!isLong(divisor)) divisor = fromValue(divisor);
        if (divisor.isZero()) throw Error("division by zero");
        if (wasm) {
          if (!this.unsigned && this.high === -2147483648 && divisor.low === -1 && divisor.high === -1) {
            return this;
          }
          var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(
            this.low,
            this.high,
            divisor.low,
            divisor.high
          );
          return fromBits(low, wasm["get_high"](), this.unsigned);
        }
        if (this.isZero()) return this.unsigned ? UZERO : ZERO;
        var approx, rem, res;
        if (!this.unsigned) {
          if (this.eq(MIN_VALUE)) {
            if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
              return MIN_VALUE;
            else if (divisor.eq(MIN_VALUE)) return ONE;
            else {
              var halfThis = this.shr(1);
              approx = halfThis.div(divisor).shl(1);
              if (approx.eq(ZERO)) {
                return divisor.isNegative() ? ONE : NEG_ONE;
              } else {
                rem = this.sub(divisor.mul(approx));
                res = approx.add(rem.div(divisor));
                return res;
              }
            }
          } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
          if (this.isNegative()) {
            if (divisor.isNegative()) return this.neg().div(divisor.neg());
            return this.neg().div(divisor).neg();
          } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
          res = ZERO;
        } else {
          if (!divisor.unsigned) divisor = divisor.toUnsigned();
          if (divisor.gt(this)) return UZERO;
          if (divisor.gt(this.shru(1)))
            return UONE;
          res = UZERO;
        }
        rem = this;
        while (rem.gte(divisor)) {
          approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));
          var log2 = Math.ceil(Math.log(approx) / Math.LN2), delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48), approxRes = fromNumber(approx), approxRem = approxRes.mul(divisor);
          while (approxRem.isNegative() || approxRem.gt(rem)) {
            approx -= delta;
            approxRes = fromNumber(approx, this.unsigned);
            approxRem = approxRes.mul(divisor);
          }
          if (approxRes.isZero()) approxRes = ONE;
          res = res.add(approxRes);
          rem = rem.sub(approxRem);
        }
        return res;
      };
      LongPrototype.div = LongPrototype.divide;
      LongPrototype.modulo = function modulo(divisor) {
        if (!isLong(divisor)) divisor = fromValue(divisor);
        if (wasm) {
          var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(
            this.low,
            this.high,
            divisor.low,
            divisor.high
          );
          return fromBits(low, wasm["get_high"](), this.unsigned);
        }
        return this.sub(this.div(divisor).mul(divisor));
      };
      LongPrototype.mod = LongPrototype.modulo;
      LongPrototype.rem = LongPrototype.modulo;
      LongPrototype.not = function not() {
        return fromBits(~this.low, ~this.high, this.unsigned);
      };
      LongPrototype.countLeadingZeros = function countLeadingZeros() {
        return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
      };
      LongPrototype.clz = LongPrototype.countLeadingZeros;
      LongPrototype.countTrailingZeros = function countTrailingZeros() {
        return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
      };
      LongPrototype.ctz = LongPrototype.countTrailingZeros;
      LongPrototype.and = function and(other) {
        if (!isLong(other)) other = fromValue(other);
        return fromBits(
          this.low & other.low,
          this.high & other.high,
          this.unsigned
        );
      };
      LongPrototype.or = function or(other) {
        if (!isLong(other)) other = fromValue(other);
        return fromBits(
          this.low | other.low,
          this.high | other.high,
          this.unsigned
        );
      };
      LongPrototype.xor = function xor2(other) {
        if (!isLong(other)) other = fromValue(other);
        return fromBits(
          this.low ^ other.low,
          this.high ^ other.high,
          this.unsigned
        );
      };
      LongPrototype.shiftLeft = function shiftLeft(numBits) {
        if (isLong(numBits)) numBits = numBits.toInt();
        if ((numBits &= 63) === 0) return this;
        else if (numBits < 32)
          return fromBits(
            this.low << numBits,
            this.high << numBits | this.low >>> 32 - numBits,
            this.unsigned
          );
        else return fromBits(0, this.low << numBits - 32, this.unsigned);
      };
      LongPrototype.shl = LongPrototype.shiftLeft;
      LongPrototype.shiftRight = function shiftRight(numBits) {
        if (isLong(numBits)) numBits = numBits.toInt();
        if ((numBits &= 63) === 0) return this;
        else if (numBits < 32)
          return fromBits(
            this.low >>> numBits | this.high << 32 - numBits,
            this.high >> numBits,
            this.unsigned
          );
        else
          return fromBits(
            this.high >> numBits - 32,
            this.high >= 0 ? 0 : -1,
            this.unsigned
          );
      };
      LongPrototype.shr = LongPrototype.shiftRight;
      LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
        if (isLong(numBits)) numBits = numBits.toInt();
        if ((numBits &= 63) === 0) return this;
        if (numBits < 32)
          return fromBits(
            this.low >>> numBits | this.high << 32 - numBits,
            this.high >>> numBits,
            this.unsigned
          );
        if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
        return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
      };
      LongPrototype.shru = LongPrototype.shiftRightUnsigned;
      LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
      LongPrototype.rotateLeft = function rotateLeft(numBits) {
        var b;
        if (isLong(numBits)) numBits = numBits.toInt();
        if ((numBits &= 63) === 0) return this;
        if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
        if (numBits < 32) {
          b = 32 - numBits;
          return fromBits(
            this.low << numBits | this.high >>> b,
            this.high << numBits | this.low >>> b,
            this.unsigned
          );
        }
        numBits -= 32;
        b = 32 - numBits;
        return fromBits(
          this.high << numBits | this.low >>> b,
          this.low << numBits | this.high >>> b,
          this.unsigned
        );
      };
      LongPrototype.rotl = LongPrototype.rotateLeft;
      LongPrototype.rotateRight = function rotateRight(numBits) {
        var b;
        if (isLong(numBits)) numBits = numBits.toInt();
        if ((numBits &= 63) === 0) return this;
        if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
        if (numBits < 32) {
          b = 32 - numBits;
          return fromBits(
            this.high << b | this.low >>> numBits,
            this.low << b | this.high >>> numBits,
            this.unsigned
          );
        }
        numBits -= 32;
        b = 32 - numBits;
        return fromBits(
          this.low << b | this.high >>> numBits,
          this.high << b | this.low >>> numBits,
          this.unsigned
        );
      };
      LongPrototype.rotr = LongPrototype.rotateRight;
      LongPrototype.toSigned = function toSigned() {
        if (!this.unsigned) return this;
        return fromBits(this.low, this.high, false);
      };
      LongPrototype.toUnsigned = function toUnsigned() {
        if (this.unsigned) return this;
        return fromBits(this.low, this.high, true);
      };
      LongPrototype.toBytes = function toBytes(le) {
        return le ? this.toBytesLE() : this.toBytesBE();
      };
      LongPrototype.toBytesLE = function toBytesLE() {
        var hi = this.high, lo = this.low;
        return [
          lo & 255,
          lo >>> 8 & 255,
          lo >>> 16 & 255,
          lo >>> 24,
          hi & 255,
          hi >>> 8 & 255,
          hi >>> 16 & 255,
          hi >>> 24
        ];
      };
      LongPrototype.toBytesBE = function toBytesBE() {
        var hi = this.high, lo = this.low;
        return [
          hi >>> 24,
          hi >>> 16 & 255,
          hi >>> 8 & 255,
          hi & 255,
          lo >>> 24,
          lo >>> 16 & 255,
          lo >>> 8 & 255,
          lo & 255
        ];
      };
      Long2.fromBytes = function fromBytes(bytes, unsigned, le) {
        return le ? Long2.fromBytesLE(bytes, unsigned) : Long2.fromBytesBE(bytes, unsigned);
      };
      Long2.fromBytesLE = function fromBytesLE(bytes, unsigned) {
        return new Long2(
          bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
          bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24,
          unsigned
        );
      };
      Long2.fromBytesBE = function fromBytesBE(bytes, unsigned) {
        return new Long2(
          bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7],
          bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3],
          unsigned
        );
      };
      if (typeof BigInt === "function") {
        Long2.fromBigInt = function fromBigInt(value, unsigned) {
          var lowBits = Number(BigInt.asIntN(32, value));
          var highBits = Number(BigInt.asIntN(32, value >> BigInt(32)));
          return fromBits(lowBits, highBits, unsigned);
        };
        Long2.fromValue = function fromValueWithBigInt(value, unsigned) {
          if (typeof value === "bigint") return Long2.fromBigInt(value, unsigned);
          return fromValue(value, unsigned);
        };
        LongPrototype.toBigInt = function toBigInt() {
          var lowBigInt = BigInt(this.low >>> 0);
          var highBigInt = BigInt(this.unsigned ? this.high >>> 0 : this.high);
          return highBigInt << BigInt(32) | lowBigInt;
        };
      }
      _exports.default = Long2;
    }
  );
})(umd, umd.exports);
var umdExports = umd.exports;
var string = {};
const Iconv = requireLib$1();
const { createLRU: createLRU$1 } = lib;
const decoderCache = createLRU$1({
  max: 500
});
string.decode = function(buffer, encoding, start, end, options) {
  if (Buffer.isEncoding(encoding)) {
    return buffer.toString(encoding, start, end);
  }
  let decoder;
  if (!options) {
    decoder = decoderCache.get(encoding);
    if (!decoder) {
      decoder = Iconv.getDecoder(encoding);
      decoderCache.set(encoding, decoder);
    }
  } else {
    const decoderArgs = { encoding, options };
    const decoderKey = JSON.stringify(decoderArgs);
    decoder = decoderCache.get(decoderKey);
    if (!decoder) {
      decoder = Iconv.getDecoder(decoderArgs.encoding, decoderArgs.options);
      decoderCache.set(decoderKey, decoder);
    }
  }
  const res = decoder.write(buffer.slice(start, end));
  const trail = decoder.end();
  return trail ? res + trail : res;
};
string.encode = function(string2, encoding, options) {
  if (Buffer.isEncoding(encoding)) {
    return Buffer.from(string2, encoding);
  }
  const encoder = Iconv.getEncoder(encoding, options || {});
  const res = encoder.write(string2);
  const trail = encoder.end();
  return trail && trail.length > 0 ? Buffer.concat([res, trail]) : res;
};
var types = { exports: {} };
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes) return types.exports;
  hasRequiredTypes = 1;
  types.exports = {
    0: "DECIMAL",
    // aka DECIMAL
    1: "TINY",
    // aka TINYINT, 1 byte
    2: "SHORT",
    // aka SMALLINT, 2 bytes
    3: "LONG",
    // aka INT, 4 bytes
    4: "FLOAT",
    // aka FLOAT, 4-8 bytes
    5: "DOUBLE",
    // aka DOUBLE, 8 bytes
    6: "NULL",
    // NULL (used for prepared statements, I think)
    7: "TIMESTAMP",
    // aka TIMESTAMP
    8: "LONGLONG",
    // aka BIGINT, 8 bytes
    9: "INT24",
    // aka MEDIUMINT, 3 bytes
    10: "DATE",
    // aka DATE
    11: "TIME",
    // aka TIME
    12: "DATETIME",
    // aka DATETIME
    13: "YEAR",
    // aka YEAR, 1 byte (don't ask)
    14: "NEWDATE",
    // aka ?
    15: "VARCHAR",
    // aka VARCHAR (?)
    16: "BIT",
    // aka BIT, 1-8 byte
    245: "JSON",
    246: "NEWDECIMAL",
    // aka DECIMAL
    247: "ENUM",
    // aka ENUM
    248: "SET",
    // aka SET
    249: "TINY_BLOB",
    // aka TINYBLOB, TINYTEXT
    250: "MEDIUM_BLOB",
    // aka MEDIUMBLOB, MEDIUMTEXT
    251: "LONG_BLOB",
    // aka LONGBLOG, LONGTEXT
    252: "BLOB",
    // aka BLOB, TEXT
    253: "VAR_STRING",
    // aka VARCHAR, VARBINARY
    254: "STRING",
    // aka CHAR, BINARY
    255: "GEOMETRY"
    // aka GEOMETRY
  };
  types.exports.DECIMAL = 0;
  types.exports.TINY = 1;
  types.exports.SHORT = 2;
  types.exports.LONG = 3;
  types.exports.FLOAT = 4;
  types.exports.DOUBLE = 5;
  types.exports.NULL = 6;
  types.exports.TIMESTAMP = 7;
  types.exports.LONGLONG = 8;
  types.exports.INT24 = 9;
  types.exports.DATE = 10;
  types.exports.TIME = 11;
  types.exports.DATETIME = 12;
  types.exports.YEAR = 13;
  types.exports.NEWDATE = 14;
  types.exports.VARCHAR = 15;
  types.exports.BIT = 16;
  types.exports.VECTOR = 242;
  types.exports.JSON = 245;
  types.exports.NEWDECIMAL = 246;
  types.exports.ENUM = 247;
  types.exports.SET = 248;
  types.exports.TINY_BLOB = 249;
  types.exports.MEDIUM_BLOB = 250;
  types.exports.LONG_BLOB = 251;
  types.exports.BLOB = 252;
  types.exports.VAR_STRING = 253;
  types.exports.STRING = 254;
  types.exports.GEOMETRY = 255;
  return types.exports;
}
const ErrorCodeToName = errors;
const NativeBuffer = require$$0$1.Buffer;
const Long = umdExports;
const StringParser$3 = string;
const Types$6 = requireTypes();
const INVALID_DATE = /* @__PURE__ */ new Date(NaN);
const pad = "000000000000";
function leftPad(num, value) {
  const s = value.toString();
  if (s.length >= num) {
    return s;
  }
  return (pad + s).slice(-num);
}
const minus = "-".charCodeAt(0);
const plus = "+".charCodeAt(0);
const dot = ".".charCodeAt(0);
const exponent = "e".charCodeAt(0);
const exponentCapital = "E".charCodeAt(0);
let Packet$l = class Packet {
  constructor(id, buffer, start, end) {
    this.sequenceId = id;
    this.numPackets = 1;
    this.buffer = buffer;
    this.start = start;
    this.offset = start + 4;
    this.end = end;
  }
  // ==============================
  // readers
  // ==============================
  reset() {
    this.offset = this.start + 4;
  }
  length() {
    return this.end - this.start;
  }
  slice() {
    return this.buffer.slice(this.start, this.end);
  }
  dump() {
    console.log(
      [this.buffer.asciiSlice(this.start, this.end)],
      this.buffer.slice(this.start, this.end),
      this.length(),
      this.sequenceId
    );
  }
  haveMoreData() {
    return this.end > this.offset;
  }
  skip(num) {
    this.offset += num;
  }
  readInt8() {
    return this.buffer[this.offset++];
  }
  readInt16() {
    this.offset += 2;
    return this.buffer.readUInt16LE(this.offset - 2);
  }
  readInt24() {
    return this.readInt16() + (this.readInt8() << 16);
  }
  readInt32() {
    this.offset += 4;
    return this.buffer.readUInt32LE(this.offset - 4);
  }
  readSInt8() {
    return this.buffer.readInt8(this.offset++);
  }
  readSInt16() {
    this.offset += 2;
    return this.buffer.readInt16LE(this.offset - 2);
  }
  readSInt32() {
    this.offset += 4;
    return this.buffer.readInt32LE(this.offset - 4);
  }
  readInt64JSNumber() {
    const word0 = this.readInt32();
    const word1 = this.readInt32();
    const l = new Long(word0, word1, true);
    return l.toNumber();
  }
  readSInt64JSNumber() {
    const word0 = this.readInt32();
    const word1 = this.readInt32();
    if (!(word1 & 2147483648)) {
      return word0 + 4294967296 * word1;
    }
    const l = new Long(word0, word1, false);
    return l.toNumber();
  }
  readInt64String() {
    const word0 = this.readInt32();
    const word1 = this.readInt32();
    const res = new Long(word0, word1, true);
    return res.toString();
  }
  readSInt64String() {
    const word0 = this.readInt32();
    const word1 = this.readInt32();
    const res = new Long(word0, word1, false);
    return res.toString();
  }
  readInt64() {
    const word0 = this.readInt32();
    const word1 = this.readInt32();
    let res = new Long(word0, word1, true);
    const resNumber = res.toNumber();
    const resString = res.toString();
    res = resNumber.toString() === resString ? resNumber : resString;
    return res;
  }
  readSInt64() {
    const word0 = this.readInt32();
    const word1 = this.readInt32();
    let res = new Long(word0, word1, false);
    const resNumber = res.toNumber();
    const resString = res.toString();
    res = resNumber.toString() === resString ? resNumber : resString;
    return res;
  }
  isEOF() {
    return this.buffer[this.offset] === 254 && this.length() < 13;
  }
  eofStatusFlags() {
    return this.buffer.readInt16LE(this.offset + 3);
  }
  eofWarningCount() {
    return this.buffer.readInt16LE(this.offset + 1);
  }
  readLengthCodedNumber(bigNumberStrings, signed) {
    const byte1 = this.buffer[this.offset++];
    if (byte1 < 251) {
      return byte1;
    }
    return this.readLengthCodedNumberExt(byte1, bigNumberStrings, signed);
  }
  readLengthCodedNumberSigned(bigNumberStrings) {
    return this.readLengthCodedNumber(bigNumberStrings, true);
  }
  readLengthCodedNumberExt(tag, bigNumberStrings, signed) {
    let word0, word1;
    let res;
    if (tag === 251) {
      return null;
    }
    if (tag === 252) {
      return this.readInt8() + (this.readInt8() << 8);
    }
    if (tag === 253) {
      return this.readInt8() + (this.readInt8() << 8) + (this.readInt8() << 16);
    }
    if (tag === 254) {
      word0 = this.readInt32();
      word1 = this.readInt32();
      if (word1 === 0) {
        return word0;
      }
      if (word1 < 2097152) {
        return word1 * 4294967296 + word0;
      }
      res = new Long(word0, word1, !signed);
      const resNumber = res.toNumber();
      const resString = res.toString();
      res = resNumber.toString() === resString ? resNumber : resString;
      return bigNumberStrings ? resString : res;
    }
    console.trace();
    throw new Error(`Should not reach here: ${tag}`);
  }
  readFloat() {
    const res = this.buffer.readFloatLE(this.offset);
    this.offset += 4;
    return res;
  }
  readDouble() {
    const res = this.buffer.readDoubleLE(this.offset);
    this.offset += 8;
    return res;
  }
  readBuffer(len) {
    if (typeof len === "undefined") {
      len = this.end - this.offset;
    }
    this.offset += len;
    return this.buffer.slice(this.offset - len, this.offset);
  }
  // DATE, DATETIME and TIMESTAMP
  readDateTime(timezone) {
    if (!timezone || timezone === "Z" || timezone === "local") {
      const length2 = this.readInt8();
      if (length2 === 251) {
        return null;
      }
      let y = 0;
      let m = 0;
      let d = 0;
      let H = 0;
      let M = 0;
      let S = 0;
      let ms = 0;
      if (length2 > 3) {
        y = this.readInt16();
        m = this.readInt8();
        d = this.readInt8();
      }
      if (length2 > 6) {
        H = this.readInt8();
        M = this.readInt8();
        S = this.readInt8();
      }
      if (length2 > 10) {
        ms = this.readInt32() / 1e3;
      }
      if (y + m + d + H + M + S + ms === 0) {
        return INVALID_DATE;
      }
      if (timezone === "Z") {
        return new Date(Date.UTC(y, m - 1, d, H, M, S, ms));
      }
      return new Date(y, m - 1, d, H, M, S, ms);
    }
    let str = this.readDateTimeString(6, "T", null);
    if (str.length === 10) {
      str += "T00:00:00";
    }
    return new Date(str + timezone);
  }
  readDateTimeString(decimals, timeSep, columnType) {
    const length2 = this.readInt8();
    let y = 0;
    let m = 0;
    let d = 0;
    let H = 0;
    let M = 0;
    let S = 0;
    let ms = 0;
    let str;
    if (length2 > 3) {
      y = this.readInt16();
      m = this.readInt8();
      d = this.readInt8();
      str = [leftPad(4, y), leftPad(2, m), leftPad(2, d)].join("-");
    }
    if (length2 > 6) {
      H = this.readInt8();
      M = this.readInt8();
      S = this.readInt8();
      str += `${timeSep || " "}${[
        leftPad(2, H),
        leftPad(2, M),
        leftPad(2, S)
      ].join(":")}`;
    } else if (columnType === Types$6.DATETIME) {
      str += " 00:00:00";
    }
    if (length2 > 10) {
      ms = this.readInt32();
      str += ".";
      if (decimals) {
        ms = leftPad(6, ms);
        if (ms.length > decimals) {
          ms = ms.substring(0, decimals);
        }
      }
      str += ms;
    }
    return str;
  }
  // TIME - value as a string, Can be negative
  readTimeString(convertTtoMs) {
    const length2 = this.readInt8();
    if (length2 === 0) {
      return "00:00:00";
    }
    const sign = this.readInt8() ? -1 : 1;
    let d = 0;
    let H = 0;
    let M = 0;
    let S = 0;
    let ms = 0;
    if (length2 > 6) {
      d = this.readInt32();
      H = this.readInt8();
      M = this.readInt8();
      S = this.readInt8();
    }
    if (length2 > 10) {
      ms = this.readInt32();
    }
    if (convertTtoMs) {
      H += d * 24;
      M += H * 60;
      S += M * 60;
      ms += S * 1e3;
      ms *= sign;
      return ms;
    }
    return (sign === -1 ? "-" : "") + [leftPad(2, d * 24 + H), leftPad(2, M), leftPad(2, S)].join(":") + (ms ? `.${ms}`.replace(/0+$/, "") : "");
  }
  readLengthCodedString(encoding) {
    const len = this.readLengthCodedNumber();
    if (len === null) {
      return null;
    }
    this.offset += len;
    return StringParser$3.decode(
      this.buffer,
      encoding,
      this.offset - len,
      this.offset
    );
  }
  readLengthCodedBuffer() {
    const len = this.readLengthCodedNumber();
    if (len === null) {
      return null;
    }
    return this.readBuffer(len);
  }
  readNullTerminatedString(encoding) {
    const start = this.offset;
    let end = this.offset;
    while (this.buffer[end]) {
      end = end + 1;
    }
    this.offset = end + 1;
    return StringParser$3.decode(this.buffer, encoding, start, end);
  }
  // TODO reuse?
  readString(len, encoding) {
    if (typeof len === "string" && typeof encoding === "undefined") {
      encoding = len;
      len = void 0;
    }
    if (typeof len === "undefined") {
      len = this.end - this.offset;
    }
    this.offset += len;
    return StringParser$3.decode(
      this.buffer,
      encoding,
      this.offset - len,
      this.offset
    );
  }
  parseInt(len, supportBigNumbers) {
    if (len === null) {
      return null;
    }
    if (len >= 14 && !supportBigNumbers) {
      const s = this.buffer.toString("ascii", this.offset, this.offset + len);
      this.offset += len;
      return Number(s);
    }
    let result = 0;
    const start = this.offset;
    const end = this.offset + len;
    let sign = 1;
    if (len === 0) {
      return 0;
    }
    if (this.buffer[this.offset] === minus) {
      this.offset++;
      sign = -1;
    }
    let str;
    const numDigits = end - this.offset;
    if (supportBigNumbers) {
      if (numDigits >= 15) {
        str = this.readString(end - this.offset, "binary");
        result = parseInt(str, 10);
        if (result.toString() === str) {
          return sign * result;
        }
        return sign === -1 ? `-${str}` : str;
      }
      if (numDigits > 16) {
        str = this.readString(end - this.offset);
        return sign === -1 ? `-${str}` : str;
      }
    }
    if (this.buffer[this.offset] === plus) {
      this.offset++;
    }
    while (this.offset < end) {
      result *= 10;
      result += this.buffer[this.offset] - 48;
      this.offset++;
    }
    const num = result * sign;
    if (!supportBigNumbers) {
      return num;
    }
    str = this.buffer.toString("ascii", start, end);
    if (num.toString() === str) {
      return num;
    }
    return str;
  }
  // note that if value of inputNumberAsString is bigger than MAX_SAFE_INTEGER
  // ( or smaller than MIN_SAFE_INTEGER ) the parseIntNoBigCheck result might be
  // different from what you would get from Number(inputNumberAsString)
  // String(parseIntNoBigCheck) <> String(Number(inputNumberAsString)) <> inputNumberAsString
  parseIntNoBigCheck(len) {
    if (len === null) {
      return null;
    }
    let result = 0;
    const end = this.offset + len;
    let sign = 1;
    if (len === 0) {
      return 0;
    }
    if (this.buffer[this.offset] === minus) {
      this.offset++;
      sign = -1;
    }
    if (this.buffer[this.offset] === plus) {
      this.offset++;
    }
    while (this.offset < end) {
      result *= 10;
      result += this.buffer[this.offset] - 48;
      this.offset++;
    }
    return result * sign;
  }
  // copy-paste from https://github.com/mysqljs/mysql/blob/master/lib/protocol/Parser.js
  parseGeometryValue() {
    const buffer = this.readLengthCodedBuffer();
    let offset = 4;
    if (buffer === null || !buffer.length) {
      return null;
    }
    function parseGeometry() {
      let x, y, i, j, numPoints, line;
      let result = null;
      const byteOrder = buffer.readUInt8(offset);
      offset += 1;
      const wkbType = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
      offset += 4;
      switch (wkbType) {
        case 1:
          x = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset);
          offset += 8;
          y = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset);
          offset += 8;
          result = { x, y };
          break;
        case 2:
          numPoints = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
          offset += 4;
          result = [];
          for (i = numPoints; i > 0; i--) {
            x = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset);
            offset += 8;
            y = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset);
            offset += 8;
            result.push({ x, y });
          }
          break;
        case 3:
          const numRings = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
          offset += 4;
          result = [];
          for (i = numRings; i > 0; i--) {
            numPoints = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
            offset += 4;
            line = [];
            for (j = numPoints; j > 0; j--) {
              x = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset);
              offset += 8;
              y = byteOrder ? buffer.readDoubleLE(offset) : buffer.readDoubleBE(offset);
              offset += 8;
              line.push({ x, y });
            }
            result.push(line);
          }
          break;
        case 4:
        case 5:
        case 6:
        case 7:
          const num = byteOrder ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
          offset += 4;
          result = [];
          for (i = num; i > 0; i--) {
            result.push(parseGeometry());
          }
          break;
      }
      return result;
    }
    return parseGeometry();
  }
  parseVector() {
    const bufLen = this.readLengthCodedNumber();
    const vectorEnd = this.offset + bufLen;
    const result = [];
    while (this.offset < vectorEnd && this.offset < this.end) {
      result.push(this.readFloat());
    }
    return result;
  }
  parseDate(timezone) {
    const strLen = this.readLengthCodedNumber();
    if (strLen === null) {
      return null;
    }
    if (strLen !== 10) {
      return /* @__PURE__ */ new Date(NaN);
    }
    const y = this.parseInt(4);
    this.offset++;
    const m = this.parseInt(2);
    this.offset++;
    const d = this.parseInt(2);
    if (!timezone || timezone === "local") {
      return new Date(y, m - 1, d);
    }
    if (timezone === "Z") {
      return new Date(Date.UTC(y, m - 1, d));
    }
    return /* @__PURE__ */ new Date(
      `${leftPad(4, y)}-${leftPad(2, m)}-${leftPad(2, d)}T00:00:00${timezone}`
    );
  }
  parseDateTime(timezone) {
    const str = this.readLengthCodedString("binary");
    if (str === null) {
      return null;
    }
    if (!timezone || timezone === "local") {
      return new Date(str);
    }
    return /* @__PURE__ */ new Date(`${str}${timezone}`);
  }
  parseFloat(len) {
    if (len === null) {
      return null;
    }
    let result = 0;
    const end = this.offset + len;
    let factor = 1;
    let pastDot = false;
    let charCode = 0;
    if (len === 0) {
      return 0;
    }
    if (this.buffer[this.offset] === minus) {
      this.offset++;
      factor = -1;
    }
    if (this.buffer[this.offset] === plus) {
      this.offset++;
    }
    while (this.offset < end) {
      charCode = this.buffer[this.offset];
      if (charCode === dot) {
        pastDot = true;
        this.offset++;
      } else if (charCode === exponent || charCode === exponentCapital) {
        this.offset++;
        const exponentValue = this.parseInt(end - this.offset);
        return result / factor * Math.pow(10, exponentValue);
      } else {
        result *= 10;
        result += this.buffer[this.offset] - 48;
        this.offset++;
        if (pastDot) {
          factor = factor * 10;
        }
      }
    }
    return result / factor;
  }
  parseLengthCodedIntNoBigCheck() {
    return this.parseIntNoBigCheck(this.readLengthCodedNumber());
  }
  parseLengthCodedInt(supportBigNumbers) {
    return this.parseInt(this.readLengthCodedNumber(), supportBigNumbers);
  }
  parseLengthCodedIntString() {
    return this.readLengthCodedString("binary");
  }
  parseLengthCodedFloat() {
    return this.parseFloat(this.readLengthCodedNumber());
  }
  peekByte() {
    return this.buffer[this.offset];
  }
  // OxFE is often used as "Alt" flag - not ok, not error.
  // For example, it's first byte of AuthSwitchRequest
  isAlt() {
    return this.peekByte() === 254;
  }
  isError() {
    return this.peekByte() === 255;
  }
  asError(encoding) {
    this.reset();
    this.readInt8();
    const errorCode = this.readInt16();
    let sqlState = "";
    if (this.buffer[this.offset] === 35) {
      this.skip(1);
      sqlState = this.readBuffer(5).toString();
    }
    const message = this.readString(void 0, encoding);
    const err = new Error(message);
    err.code = ErrorCodeToName[errorCode];
    err.errno = errorCode;
    err.sqlState = sqlState;
    err.sqlMessage = message;
    return err;
  }
  writeInt32(n) {
    this.buffer.writeUInt32LE(n, this.offset);
    this.offset += 4;
  }
  writeInt24(n) {
    this.writeInt8(n & 255);
    this.writeInt16(n >> 8);
  }
  writeInt16(n) {
    this.buffer.writeUInt16LE(n, this.offset);
    this.offset += 2;
  }
  writeInt8(n) {
    this.buffer.writeUInt8(n, this.offset);
    this.offset++;
  }
  writeDouble(n) {
    this.buffer.writeDoubleLE(n, this.offset);
    this.offset += 8;
  }
  writeBuffer(b) {
    b.copy(this.buffer, this.offset);
    this.offset += b.length;
  }
  writeNull() {
    this.buffer[this.offset] = 251;
    this.offset++;
  }
  // TODO: refactor following three?
  writeNullTerminatedString(s, encoding) {
    const buf = StringParser$3.encode(s, encoding);
    this.buffer.length && buf.copy(this.buffer, this.offset);
    this.offset += buf.length;
    this.writeInt8(0);
  }
  writeString(s, encoding) {
    if (s === null) {
      this.writeInt8(251);
      return;
    }
    if (s.length === 0) {
      return;
    }
    const buf = StringParser$3.encode(s, encoding);
    this.buffer.length && buf.copy(this.buffer, this.offset);
    this.offset += buf.length;
  }
  writeLengthCodedString(s, encoding) {
    const buf = StringParser$3.encode(s, encoding);
    this.writeLengthCodedNumber(buf.length);
    this.buffer.length && buf.copy(this.buffer, this.offset);
    this.offset += buf.length;
  }
  writeLengthCodedBuffer(b) {
    this.writeLengthCodedNumber(b.length);
    b.copy(this.buffer, this.offset);
    this.offset += b.length;
  }
  writeLengthCodedNumber(n) {
    if (n < 251) {
      return this.writeInt8(n);
    }
    if (n < 65535) {
      this.writeInt8(252);
      return this.writeInt16(n);
    }
    if (n < 16777215) {
      this.writeInt8(253);
      return this.writeInt24(n);
    }
    if (n === null) {
      return this.writeInt8(251);
    }
    this.writeInt8(254);
    this.buffer.writeUInt32LE(n, this.offset);
    this.offset += 4;
    this.buffer.writeUInt32LE(n >> 32, this.offset);
    this.offset += 4;
    return this.offset;
  }
  writeDate(d, timezone) {
    this.buffer.writeUInt8(11, this.offset);
    if (!timezone || timezone === "local") {
      this.buffer.writeUInt16LE(d.getFullYear(), this.offset + 1);
      this.buffer.writeUInt8(d.getMonth() + 1, this.offset + 3);
      this.buffer.writeUInt8(d.getDate(), this.offset + 4);
      this.buffer.writeUInt8(d.getHours(), this.offset + 5);
      this.buffer.writeUInt8(d.getMinutes(), this.offset + 6);
      this.buffer.writeUInt8(d.getSeconds(), this.offset + 7);
      this.buffer.writeUInt32LE(d.getMilliseconds() * 1e3, this.offset + 8);
    } else {
      if (timezone !== "Z") {
        const offset = (timezone[0] === "-" ? -1 : 1) * (parseInt(timezone.substring(1, 3), 10) * 60 + parseInt(timezone.substring(4), 10));
        if (offset !== 0) {
          d = new Date(d.getTime() + 6e4 * offset);
        }
      }
      this.buffer.writeUInt16LE(d.getUTCFullYear(), this.offset + 1);
      this.buffer.writeUInt8(d.getUTCMonth() + 1, this.offset + 3);
      this.buffer.writeUInt8(d.getUTCDate(), this.offset + 4);
      this.buffer.writeUInt8(d.getUTCHours(), this.offset + 5);
      this.buffer.writeUInt8(d.getUTCMinutes(), this.offset + 6);
      this.buffer.writeUInt8(d.getUTCSeconds(), this.offset + 7);
      this.buffer.writeUInt32LE(d.getUTCMilliseconds() * 1e3, this.offset + 8);
    }
    this.offset += 12;
  }
  writeHeader(sequenceId) {
    const offset = this.offset;
    this.offset = 0;
    this.writeInt24(this.buffer.length - 4);
    this.writeInt8(sequenceId);
    this.offset = offset;
  }
  clone() {
    return new Packet(this.sequenceId, this.buffer, this.start, this.end);
  }
  type() {
    if (this.isEOF()) {
      return "EOF";
    }
    if (this.isError()) {
      return "Error";
    }
    if (this.buffer[this.offset] === 0) {
      return "maybeOK";
    }
    return "";
  }
  static lengthCodedNumberLength(n) {
    if (n < 251) {
      return 1;
    }
    if (n < 65535) {
      return 3;
    }
    if (n < 16777215) {
      return 5;
    }
    return 9;
  }
  static lengthCodedStringLength(str, encoding) {
    const buf = StringParser$3.encode(str, encoding);
    const slen = buf.length;
    return Packet.lengthCodedNumberLength(slen) + slen;
  }
  static MockBuffer() {
    const noop = function() {
    };
    const res = Buffer.alloc(0);
    for (const op in NativeBuffer.prototype) {
      if (typeof res[op] === "function") {
        res[op] = noop;
      }
    }
    return res;
  }
};
var packet = Packet$l;
const Packet$k = packet;
const MAX_PACKET_LENGTH = 16777215;
function readPacketLength(b, off) {
  const b0 = b[off];
  const b1 = b[off + 1];
  const b2 = b[off + 2];
  if (b1 + b2 === 0) {
    return b0;
  }
  return b0 + (b1 << 8) + (b2 << 16);
}
let PacketParser$1 = class PacketParser {
  constructor(onPacket, packetHeaderLength) {
    if (typeof packetHeaderLength === "undefined") {
      packetHeaderLength = 4;
    }
    this.buffer = [];
    this.bufferLength = 0;
    this.packetHeaderLength = packetHeaderLength;
    this.headerLen = 0;
    this.length = 0;
    this.largePacketParts = [];
    this.firstPacketSequenceId = 0;
    this.onPacket = onPacket;
    this.execute = PacketParser.prototype.executeStart;
    this._flushLargePacket = packetHeaderLength === 7 ? this._flushLargePacket7 : this._flushLargePacket4;
  }
  _flushLargePacket4() {
    const numPackets = this.largePacketParts.length;
    this.largePacketParts.unshift(Buffer.from([0, 0, 0, 0]));
    const body = Buffer.concat(this.largePacketParts);
    const packet2 = new Packet$k(this.firstPacketSequenceId, body, 0, body.length);
    this.largePacketParts.length = 0;
    packet2.numPackets = numPackets;
    this.onPacket(packet2);
  }
  _flushLargePacket7() {
    const numPackets = this.largePacketParts.length;
    this.largePacketParts.unshift(Buffer.from([0, 0, 0, 0, 0, 0, 0]));
    const body = Buffer.concat(this.largePacketParts);
    this.largePacketParts.length = 0;
    const packet2 = new Packet$k(this.firstPacketSequenceId, body, 0, body.length);
    packet2.numPackets = numPackets;
    this.onPacket(packet2);
  }
  executeStart(chunk) {
    let start = 0;
    const end = chunk.length;
    while (end - start >= 3) {
      this.length = readPacketLength(chunk, start);
      if (end - start >= this.length + this.packetHeaderLength) {
        const sequenceId = chunk[start + 3];
        if (this.length < MAX_PACKET_LENGTH && this.largePacketParts.length === 0) {
          this.onPacket(
            new Packet$k(
              sequenceId,
              chunk,
              start,
              start + this.packetHeaderLength + this.length
            )
          );
        } else {
          if (this.largePacketParts.length === 0) {
            this.firstPacketSequenceId = sequenceId;
          }
          this.largePacketParts.push(
            chunk.slice(
              start + this.packetHeaderLength,
              start + this.packetHeaderLength + this.length
            )
          );
          if (this.length < MAX_PACKET_LENGTH) {
            this._flushLargePacket();
          }
        }
        start += this.packetHeaderLength + this.length;
      } else {
        this.buffer = [chunk.slice(start + 3, end)];
        this.bufferLength = end - start - 3;
        this.execute = PacketParser.prototype.executePayload;
        return;
      }
    }
    if (end - start > 0) {
      this.headerLen = end - start;
      this.length = chunk[start];
      if (this.headerLen === 2) {
        this.length = chunk[start] + (chunk[start + 1] << 8);
        this.execute = PacketParser.prototype.executeHeader3;
      } else {
        this.execute = PacketParser.prototype.executeHeader2;
      }
    }
  }
  executePayload(chunk) {
    let start = 0;
    const end = chunk.length;
    const remainingPayload = this.length - this.bufferLength + this.packetHeaderLength - 3;
    if (end - start >= remainingPayload) {
      const payload = Buffer.allocUnsafe(this.length + this.packetHeaderLength);
      let offset = 3;
      for (let i = 0; i < this.buffer.length; ++i) {
        this.buffer[i].copy(payload, offset);
        offset += this.buffer[i].length;
      }
      chunk.copy(payload, offset, start, start + remainingPayload);
      const sequenceId = payload[3];
      if (this.length < MAX_PACKET_LENGTH && this.largePacketParts.length === 0) {
        this.onPacket(
          new Packet$k(
            sequenceId,
            payload,
            0,
            this.length + this.packetHeaderLength
          )
        );
      } else {
        if (this.largePacketParts.length === 0) {
          this.firstPacketSequenceId = sequenceId;
        }
        this.largePacketParts.push(
          payload.slice(
            this.packetHeaderLength,
            this.packetHeaderLength + this.length
          )
        );
        if (this.length < MAX_PACKET_LENGTH) {
          this._flushLargePacket();
        }
      }
      this.buffer = [];
      this.bufferLength = 0;
      this.execute = PacketParser.prototype.executeStart;
      start += remainingPayload;
      if (end - start > 0) {
        return this.execute(chunk.slice(start, end));
      }
    } else {
      this.buffer.push(chunk);
      this.bufferLength += chunk.length;
    }
    return null;
  }
  executeHeader2(chunk) {
    this.length += chunk[0] << 8;
    if (chunk.length > 1) {
      this.length += chunk[1] << 16;
      this.execute = PacketParser.prototype.executePayload;
      return this.executePayload(chunk.slice(2));
    }
    this.execute = PacketParser.prototype.executeHeader3;
    return null;
  }
  executeHeader3(chunk) {
    this.length += chunk[0] << 16;
    this.execute = PacketParser.prototype.executePayload;
    return this.executePayload(chunk.slice(1));
  }
};
var packet_parser = PacketParser$1;
var packets = { exports: {} };
const Packet$j = packet;
class AuthNextFactor {
  constructor(opts) {
    this.pluginName = opts.pluginName;
    this.pluginData = opts.pluginData;
  }
  toPacket(encoding) {
    const length2 = 6 + this.pluginName.length + this.pluginData.length;
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$j(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeInt8(2);
    packet2.writeNullTerminatedString(this.pluginName, encoding);
    packet2.writeBuffer(this.pluginData);
    return packet2;
  }
  static fromPacket(packet2, encoding) {
    packet2.readInt8();
    const name = packet2.readNullTerminatedString(encoding);
    const data = packet2.readBuffer();
    return new AuthNextFactor({
      pluginName: name,
      pluginData: data
    });
  }
}
var auth_next_factor = AuthNextFactor;
const Packet$i = packet;
class AuthSwitchRequest {
  constructor(opts) {
    this.pluginName = opts.pluginName;
    this.pluginData = opts.pluginData;
  }
  toPacket() {
    const length2 = 6 + this.pluginName.length + this.pluginData.length;
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$i(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeInt8(254);
    packet2.writeNullTerminatedString(this.pluginName, "cesu8");
    packet2.writeBuffer(this.pluginData);
    return packet2;
  }
  static fromPacket(packet2) {
    packet2.readInt8();
    const name = packet2.readNullTerminatedString("cesu8");
    const data = packet2.readBuffer();
    return new AuthSwitchRequest({
      pluginName: name,
      pluginData: data
    });
  }
}
var auth_switch_request = AuthSwitchRequest;
const Packet$h = packet;
class AuthSwitchRequestMoreData {
  constructor(data) {
    this.data = data;
  }
  toPacket() {
    const length2 = 5 + this.data.length;
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$h(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeInt8(1);
    packet2.writeBuffer(this.data);
    return packet2;
  }
  static fromPacket(packet2) {
    packet2.readInt8();
    const data = packet2.readBuffer();
    return new AuthSwitchRequestMoreData(data);
  }
  static verifyMarker(packet2) {
    return packet2.peekByte() === 1;
  }
}
var auth_switch_request_more_data = AuthSwitchRequestMoreData;
const Packet$g = packet;
class AuthSwitchResponse {
  constructor(data) {
    if (!Buffer.isBuffer(data)) {
      data = Buffer.from(data);
    }
    this.data = data;
  }
  toPacket() {
    const length2 = 4 + this.data.length;
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$g(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeBuffer(this.data);
    return packet2;
  }
  static fromPacket(packet2) {
    const data = packet2.readBuffer();
    return new AuthSwitchResponse(data);
  }
}
var auth_switch_response = AuthSwitchResponse;
const Types$5 = requireTypes();
const Packet$f = packet;
const binaryReader = new Array(256);
class BinaryRow {
  constructor(columns) {
    this.columns = columns || [];
  }
  static toPacket(columns, encoding) {
    const sequenceId = 0;
    let length2 = 0;
    columns.forEach((val) => {
      if (val === null || typeof val === "undefined") {
        ++length2;
        return;
      }
      length2 += Packet$f.lengthCodedStringLength(val.toString(10), encoding);
    });
    length2 = length2 + 2;
    const buffer = Buffer.allocUnsafe(length2 + 4);
    const packet2 = new Packet$f(sequenceId, buffer, 0, length2 + 4);
    packet2.offset = 4;
    packet2.writeInt8(0);
    let bitmap = 0;
    let bitValue = 1;
    columns.forEach((parameter) => {
      if (parameter.type === Types$5.NULL) {
        bitmap += bitValue;
      }
      bitValue *= 2;
      if (bitValue === 256) {
        packet2.writeInt8(bitmap);
        bitmap = 0;
        bitValue = 1;
      }
    });
    if (bitValue !== 1) {
      packet2.writeInt8(bitmap);
    }
    columns.forEach((val) => {
      if (val === null) {
        packet2.writeNull();
        return;
      }
      if (typeof val === "undefined") {
        packet2.writeInt8(0);
        return;
      }
      packet2.writeLengthCodedString(val.toString(10), encoding);
    });
    return packet2;
  }
  // TODO: complete list of types...
  static fromPacket(fields2, packet2) {
    const columns = new Array(fields2.length);
    packet2.readInt8();
    const nullBitmapLength = Math.floor((fields2.length + 7 + 2) / 8);
    packet2.skip(nullBitmapLength);
    for (let i = 0; i < columns.length; ++i) {
      columns[i] = binaryReader[fields2[i].columnType].apply(packet2);
    }
    return new BinaryRow(columns);
  }
}
binaryReader[Types$5.DECIMAL] = Packet$f.prototype.readLengthCodedString;
binaryReader[1] = Packet$f.prototype.readInt8;
binaryReader[2] = Packet$f.prototype.readInt16;
binaryReader[3] = Packet$f.prototype.readInt32;
binaryReader[4] = Packet$f.prototype.readFloat;
binaryReader[5] = Packet$f.prototype.readDouble;
binaryReader[6] = Packet$f.prototype.assertInvalid;
binaryReader[7] = Packet$f.prototype.readTimestamp;
binaryReader[8] = Packet$f.prototype.readInt64;
binaryReader[9] = Packet$f.prototype.readInt32;
binaryReader[10] = Packet$f.prototype.readTimestamp;
binaryReader[11] = Packet$f.prototype.readTime;
binaryReader[12] = Packet$f.prototype.readDateTime;
binaryReader[13] = Packet$f.prototype.readInt16;
binaryReader[Types$5.VAR_STRING] = Packet$f.prototype.readLengthCodedString;
var binary_row = BinaryRow;
var commands$1 = {
  QUIT: 1,
  INIT_DB: 2,
  QUERY: 3,
  FIELD_LIST: 4,
  PING: 14,
  CHANGE_USER: 17,
  BINLOG_DUMP: 18,
  REGISTER_SLAVE: 21,
  STMT_PREPARE: 22,
  STMT_EXECUTE: 23,
  STMT_CLOSE: 25
};
const Packet$e = packet;
const CommandCodes$4 = commands$1;
let BinlogDump$2 = class BinlogDump {
  constructor(opts) {
    this.binlogPos = opts.binlogPos || 0;
    this.serverId = opts.serverId || 0;
    this.flags = opts.flags || 0;
    this.filename = opts.filename || "";
  }
  toPacket() {
    const length2 = 15 + Buffer.byteLength(this.filename, "utf8");
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$e(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeInt8(CommandCodes$4.BINLOG_DUMP);
    packet2.writeInt32(this.binlogPos);
    packet2.writeInt16(this.flags);
    packet2.writeInt32(this.serverId);
    packet2.writeString(this.filename);
    return packet2;
  }
};
var binlog_dump$1 = BinlogDump$2;
var auth_41 = {};
(function(exports) {
  const crypto2 = require$$0$2;
  function sha1(msg, msg1, msg2) {
    const hash = crypto2.createHash("sha1");
    hash.update(msg);
    if (msg1) {
      hash.update(msg1);
    }
    if (msg2) {
      hash.update(msg2);
    }
    return hash.digest();
  }
  function xor2(a, b) {
    const result = Buffer.allocUnsafe(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] ^ b[i];
    }
    return result;
  }
  exports.xor = xor2;
  function token(password, scramble1, scramble2) {
    if (!password) {
      return Buffer.alloc(0);
    }
    const stage1 = sha1(password);
    return exports.calculateTokenFromPasswordSha(stage1, scramble1, scramble2);
  }
  exports.calculateTokenFromPasswordSha = function(passwordSha, scramble1, scramble2) {
    const authPluginData1 = scramble1.slice(0, 8);
    const authPluginData2 = scramble2.slice(0, 12);
    const stage2 = sha1(passwordSha);
    const stage3 = sha1(authPluginData1, authPluginData2, stage2);
    return xor2(stage3, passwordSha);
  };
  exports.calculateToken = token;
  exports.verifyToken = function(publicSeed1, publicSeed2, token2, doubleSha) {
    const hashStage1 = xor2(token2, sha1(publicSeed1, publicSeed2, doubleSha));
    const candidateHash2 = sha1(hashStage1);
    return candidateHash2.compare(doubleSha) === 0;
  };
  exports.doubleSha1 = function(password) {
    return sha1(sha1(password));
  };
  function xorRotating2(a, seed) {
    const result = Buffer.allocUnsafe(a.length);
    const seedLen = seed.length;
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] ^ seed[i % seedLen];
    }
    return result;
  }
  exports.xorRotating = xorRotating2;
})(auth_41);
var charset_encodings;
var hasRequiredCharset_encodings;
function requireCharset_encodings() {
  if (hasRequiredCharset_encodings) return charset_encodings;
  hasRequiredCharset_encodings = 1;
  charset_encodings = [
    "utf8",
    "big5",
    "latin2",
    "dec8",
    "cp850",
    "latin1",
    "hp8",
    "koi8r",
    "latin1",
    "latin2",
    "swe7",
    "ascii",
    "eucjp",
    "sjis",
    "cp1251",
    "latin1",
    "hebrew",
    "utf8",
    "tis620",
    "euckr",
    "latin7",
    "latin2",
    "koi8u",
    "cp1251",
    "gb2312",
    "greek",
    "cp1250",
    "latin2",
    "gbk",
    "cp1257",
    "latin5",
    "latin1",
    "armscii8",
    "cesu8",
    "cp1250",
    "ucs2",
    "cp866",
    "keybcs2",
    "macintosh",
    "macroman",
    "cp852",
    "latin7",
    "latin7",
    "macintosh",
    "cp1250",
    "utf8",
    "utf8",
    "latin1",
    "latin1",
    "latin1",
    "cp1251",
    "cp1251",
    "cp1251",
    "macroman",
    "utf16",
    "utf16",
    "utf16-le",
    "cp1256",
    "cp1257",
    "cp1257",
    "utf32",
    "utf32",
    "utf16-le",
    "binary",
    "armscii8",
    "ascii",
    "cp1250",
    "cp1256",
    "cp866",
    "dec8",
    "greek",
    "hebrew",
    "hp8",
    "keybcs2",
    "koi8r",
    "koi8u",
    "cesu8",
    "latin2",
    "latin5",
    "latin7",
    "cp850",
    "cp852",
    "swe7",
    "cesu8",
    "big5",
    "euckr",
    "gb2312",
    "gbk",
    "sjis",
    "tis620",
    "ucs2",
    "eucjp",
    "geostd8",
    "geostd8",
    "latin1",
    "cp932",
    "cp932",
    "eucjpms",
    "eucjpms",
    "cp1250",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf16",
    "utf8",
    "utf8",
    "utf8",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "ucs2",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "ucs2",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf32",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "cesu8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "cesu8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "gb18030",
    "gb18030",
    "gb18030",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8",
    "utf8"
  ];
  return charset_encodings;
}
const CommandCode$4 = commands$1;
const ClientConstants$6 = client;
const Packet$d = packet;
const auth41$3 = auth_41;
const CharsetToEncoding$8 = requireCharset_encodings();
let ChangeUser$2 = class ChangeUser {
  constructor(opts) {
    this.flags = opts.flags;
    this.user = opts.user || "";
    this.database = opts.database || "";
    this.password = opts.password || "";
    this.passwordSha1 = opts.passwordSha1;
    this.authPluginData1 = opts.authPluginData1;
    this.authPluginData2 = opts.authPluginData2;
    this.connectAttributes = opts.connectAttrinutes || {};
    let authToken;
    if (this.passwordSha1) {
      authToken = auth41$3.calculateTokenFromPasswordSha(
        this.passwordSha1,
        this.authPluginData1,
        this.authPluginData2
      );
    } else {
      authToken = auth41$3.calculateToken(
        this.password,
        this.authPluginData1,
        this.authPluginData2
      );
    }
    this.authToken = authToken;
    this.charsetNumber = opts.charsetNumber;
  }
  // TODO
  // ChangeUser.fromPacket = function(packet)
  // };
  serializeToBuffer(buffer) {
    const isSet = (flag) => this.flags & ClientConstants$6[flag];
    const packet2 = new Packet$d(0, buffer, 0, buffer.length);
    packet2.offset = 4;
    const encoding = CharsetToEncoding$8[this.charsetNumber];
    packet2.writeInt8(CommandCode$4.CHANGE_USER);
    packet2.writeNullTerminatedString(this.user, encoding);
    if (isSet("SECURE_CONNECTION")) {
      packet2.writeInt8(this.authToken.length);
      packet2.writeBuffer(this.authToken);
    } else {
      packet2.writeBuffer(this.authToken);
      packet2.writeInt8(0);
    }
    packet2.writeNullTerminatedString(this.database, encoding);
    packet2.writeInt16(this.charsetNumber);
    if (isSet("PLUGIN_AUTH")) {
      packet2.writeNullTerminatedString("mysql_native_password", "latin1");
    }
    if (isSet("CONNECT_ATTRS")) {
      const connectAttributes = this.connectAttributes;
      const attrNames = Object.keys(connectAttributes);
      let keysLength = 0;
      for (let k = 0; k < attrNames.length; ++k) {
        keysLength += Packet$d.lengthCodedStringLength(attrNames[k], encoding);
        keysLength += Packet$d.lengthCodedStringLength(
          connectAttributes[attrNames[k]],
          encoding
        );
      }
      packet2.writeLengthCodedNumber(keysLength);
      for (let k = 0; k < attrNames.length; ++k) {
        packet2.writeLengthCodedString(attrNames[k], encoding);
        packet2.writeLengthCodedString(
          connectAttributes[attrNames[k]],
          encoding
        );
      }
    }
    return packet2;
  }
  toPacket() {
    if (typeof this.user !== "string") {
      throw new Error('"user" connection config property must be a string');
    }
    if (typeof this.database !== "string") {
      throw new Error('"database" connection config property must be a string');
    }
    const p = this.serializeToBuffer(Packet$d.MockBuffer());
    return this.serializeToBuffer(Buffer.allocUnsafe(p.offset));
  }
};
var change_user$1 = ChangeUser$2;
const Packet$c = packet;
const CommandCodes$3 = commands$1;
let CloseStatement$2 = class CloseStatement {
  constructor(id) {
    this.id = id;
  }
  // note: no response sent back
  toPacket() {
    const packet2 = new Packet$c(0, Buffer.allocUnsafe(9), 0, 9);
    packet2.offset = 4;
    packet2.writeInt8(CommandCodes$3.STMT_CLOSE);
    packet2.writeInt32(this.id);
    return packet2;
  }
};
var close_statement$1 = CloseStatement$2;
var field_flags = {};
field_flags.NOT_NULL = 1;
field_flags.PRI_KEY = 2;
field_flags.UNIQUE_KEY = 4;
field_flags.MULTIPLE_KEY = 8;
field_flags.BLOB = 16;
field_flags.UNSIGNED = 32;
field_flags.ZEROFILL = 64;
field_flags.BINARY = 128;
field_flags.ENUM = 256;
field_flags.AUTO_INCREMENT = 512;
field_flags.TIMESTAMP = 1024;
field_flags.SET = 2048;
field_flags.NO_DEFAULT_VALUE = 4096;
field_flags.ON_UPDATE_NOW = 8192;
field_flags.NUM = 32768;
const Packet$b = packet;
const StringParser$2 = string;
const CharsetToEncoding$7 = requireCharset_encodings();
const fields = ["catalog", "schema", "table", "orgTable", "name", "orgName"];
class ColumnDefinition {
  constructor(packet2, clientEncoding) {
    this._buf = packet2.buffer;
    this._clientEncoding = clientEncoding;
    this._catalogLength = packet2.readLengthCodedNumber();
    this._catalogStart = packet2.offset;
    packet2.offset += this._catalogLength;
    this._schemaLength = packet2.readLengthCodedNumber();
    this._schemaStart = packet2.offset;
    packet2.offset += this._schemaLength;
    this._tableLength = packet2.readLengthCodedNumber();
    this._tableStart = packet2.offset;
    packet2.offset += this._tableLength;
    this._orgTableLength = packet2.readLengthCodedNumber();
    this._orgTableStart = packet2.offset;
    packet2.offset += this._orgTableLength;
    const _nameLength = packet2.readLengthCodedNumber();
    const _nameStart = packet2.offset;
    packet2.offset += _nameLength;
    this._orgNameLength = packet2.readLengthCodedNumber();
    this._orgNameStart = packet2.offset;
    packet2.offset += this._orgNameLength;
    packet2.skip(1);
    this.characterSet = packet2.readInt16();
    this.encoding = CharsetToEncoding$7[this.characterSet];
    this.name = StringParser$2.decode(
      this._buf,
      this.encoding === "binary" ? this._clientEncoding : this.encoding,
      _nameStart,
      _nameStart + _nameLength
    );
    this.columnLength = packet2.readInt32();
    this.columnType = packet2.readInt8();
    this.type = this.columnType;
    this.flags = packet2.readInt16();
    this.decimals = packet2.readInt8();
  }
  inspect() {
    return {
      catalog: this.catalog,
      schema: this.schema,
      name: this.name,
      orgName: this.orgName,
      table: this.table,
      orgTable: this.orgTable,
      characterSet: this.characterSet,
      encoding: this.encoding,
      columnLength: this.columnLength,
      type: this.columnType,
      flags: this.flags,
      decimals: this.decimals
    };
  }
  [Symbol.for("nodejs.util.inspect.custom")](depth, inspectOptions, inspect) {
    const Types2 = requireTypes();
    const typeNames2 = [];
    for (const t in Types2) {
      typeNames2[Types2[t]] = t;
    }
    const fiedFlags = field_flags;
    const flagNames2 = [];
    const inspectFlags = this.flags;
    for (const f in fiedFlags) {
      if (inspectFlags & fiedFlags[f]) {
        if (f === "PRI_KEY") {
          flagNames2.push("PRIMARY KEY");
        } else if (f === "NOT_NULL") {
          flagNames2.push("NOT NULL");
        } else if (f === "BINARY") ;
        else if (f === "MULTIPLE_KEY") ;
        else if (f === "NO_DEFAULT_VALUE") ;
        else if (f === "BLOB") ;
        else if (f === "UNSIGNED") ;
        else if (f === "TIMESTAMP") ;
        else if (f === "ON_UPDATE_NOW") {
          flagNames2.push("ON UPDATE CURRENT_TIMESTAMP");
        } else {
          flagNames2.push(f);
        }
      }
    }
    if (depth > 1) {
      return inspect({
        ...this.inspect(),
        typeName: typeNames2[this.columnType],
        flags: flagNames2
      });
    }
    const isUnsigned = this.flags & fiedFlags.UNSIGNED;
    let typeName = typeNames2[this.columnType];
    if (typeName === "BLOB") {
      if (this.columnLength === 4294967295) {
        typeName = "LONGTEXT";
      } else if (this.columnLength === 67108860) {
        typeName = "MEDIUMTEXT";
      } else if (this.columnLength === 262140) {
        typeName = "TEXT";
      } else if (this.columnLength === 1020) {
        typeName = "TINYTEXT";
      } else {
        typeName = `BLOB(${this.columnLength})`;
      }
    } else if (typeName === "VAR_STRING") {
      typeName = `VARCHAR(${Math.ceil(this.columnLength / 4)})`;
    } else if (typeName === "TINY") {
      if (this.columnLength === 3 && isUnsigned || this.columnLength === 4 && !isUnsigned) {
        typeName = "TINYINT";
      } else {
        typeName = `TINYINT(${this.columnLength})`;
      }
    } else if (typeName === "LONGLONG") {
      if (this.columnLength === 20) {
        typeName = "BIGINT";
      } else {
        typeName = `BIGINT(${this.columnLength})`;
      }
    } else if (typeName === "SHORT") {
      if (isUnsigned && this.columnLength === 5) {
        typeName = "SMALLINT";
      } else if (!isUnsigned && this.columnLength === 6) {
        typeName = "SMALLINT";
      } else {
        typeName = `SMALLINT(${this.columnLength})`;
      }
    } else if (typeName === "LONG") {
      if (isUnsigned && this.columnLength === 10) {
        typeName = "INT";
      } else if (!isUnsigned && this.columnLength === 11) {
        typeName = "INT";
      } else {
        typeName = `INT(${this.columnLength})`;
      }
    } else if (typeName === "INT24") {
      if (isUnsigned && this.columnLength === 8) {
        typeName = "MEDIUMINT";
      } else if (!isUnsigned && this.columnLength === 9) {
        typeName = "MEDIUMINT";
      } else {
        typeName = `MEDIUMINT(${this.columnLength})`;
      }
    } else if (typeName === "DOUBLE") {
      if (this.columnLength === 22 && this.decimals === 31) {
        typeName = "DOUBLE";
      } else {
        typeName = `DOUBLE(${this.columnLength},${this.decimals})`;
      }
    } else if (typeName === "FLOAT") {
      if (this.columnLength === 12 && this.decimals === 31) {
        typeName = "FLOAT";
      } else {
        typeName = `FLOAT(${this.columnLength},${this.decimals})`;
      }
    } else if (typeName === "NEWDECIMAL") {
      if (this.columnLength === 11 && this.decimals === 0) {
        typeName = "DECIMAL";
      } else if (this.decimals === 0) {
        if (isUnsigned) {
          typeName = `DECIMAL(${this.columnLength})`;
        } else {
          typeName = `DECIMAL(${this.columnLength - 1})`;
        }
      } else {
        typeName = `DECIMAL(${this.columnLength - 2},${this.decimals})`;
      }
    } else {
      typeName = `${typeNames2[this.columnType]}(${this.columnLength})`;
    }
    if (isUnsigned) {
      typeName += " UNSIGNED";
    }
    return `\`${this.name}\` ${[typeName, ...flagNames2].join(" ")}`;
  }
  static toPacket(column, sequenceId) {
    let length2 = 17;
    fields.forEach((field) => {
      length2 += Packet$b.lengthCodedStringLength(
        column[field],
        CharsetToEncoding$7[column.characterSet]
      );
    });
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$b(sequenceId, buffer, 0, length2);
    function writeField(name) {
      packet2.writeLengthCodedString(
        column[name],
        CharsetToEncoding$7[column.characterSet]
      );
    }
    packet2.offset = 4;
    fields.forEach(writeField);
    packet2.writeInt8(12);
    packet2.writeInt16(column.characterSet);
    packet2.writeInt32(column.columnLength);
    packet2.writeInt8(column.columnType);
    packet2.writeInt16(column.flags);
    packet2.writeInt8(column.decimals);
    packet2.writeInt16(0);
    return packet2;
  }
  // node-mysql compatibility: alias "db" to "schema"
  get db() {
    return this.schema;
  }
}
const addString = function(name) {
  Object.defineProperty(ColumnDefinition.prototype, name, {
    get: function() {
      const start = this[`_${name}Start`];
      const end = start + this[`_${name}Length`];
      const val = StringParser$2.decode(
        this._buf,
        this.encoding === "binary" ? this._clientEncoding : this.encoding,
        start,
        end
      );
      Object.defineProperty(this, name, {
        value: val,
        writable: false,
        configurable: false,
        enumerable: false
      });
      return val;
    }
  });
};
addString("catalog");
addString("schema");
addString("table");
addString("orgTable");
addString("orgName");
var column_definition = ColumnDefinition;
var cursor = {
  NO_CURSOR: 0
};
const CursorType = cursor;
const CommandCodes$2 = commands$1;
const Types$4 = requireTypes();
const Packet$a = packet;
const CharsetToEncoding$6 = requireCharset_encodings();
function isJSON(value) {
  return Array.isArray(value) || value.constructor === Object || typeof value.toJSON === "function" && !Buffer.isBuffer(value);
}
function toParameter(value, encoding, timezone) {
  let type = Types$4.VAR_STRING;
  let length2;
  let writer = function(value2) {
    return Packet$a.prototype.writeLengthCodedString.call(this, value2, encoding);
  };
  if (value !== null) {
    switch (typeof value) {
      case "undefined":
        throw new TypeError("Bind parameters must not contain undefined");
      case "number":
        type = Types$4.DOUBLE;
        length2 = 8;
        writer = Packet$a.prototype.writeDouble;
        break;
      case "boolean":
        value = value | 0;
        type = Types$4.TINY;
        length2 = 1;
        writer = Packet$a.prototype.writeInt8;
        break;
      case "object":
        if (Object.prototype.toString.call(value) === "[object Date]") {
          type = Types$4.DATETIME;
          length2 = 12;
          writer = function(value2) {
            return Packet$a.prototype.writeDate.call(this, value2, timezone);
          };
        } else if (isJSON(value)) {
          value = JSON.stringify(value);
          type = Types$4.JSON;
        } else if (Buffer.isBuffer(value)) {
          length2 = Packet$a.lengthCodedNumberLength(value.length) + value.length;
          writer = Packet$a.prototype.writeLengthCodedBuffer;
        }
        break;
      default:
        value = value.toString();
    }
  } else {
    value = "";
    type = Types$4.NULL;
  }
  if (!length2) {
    length2 = Packet$a.lengthCodedStringLength(value, encoding);
  }
  return { value, type, length: length2, writer };
}
let Execute$3 = class Execute {
  constructor(id, parameters, charsetNumber, timezone) {
    this.id = id;
    this.parameters = parameters;
    this.encoding = CharsetToEncoding$6[charsetNumber];
    this.timezone = timezone;
  }
  static fromPacket(packet2, encoding) {
    const stmtId = packet2.readInt32();
    const flags = packet2.readInt8();
    const iterationCount = packet2.readInt32();
    let i = packet2.offset;
    while (i < packet2.end - 1) {
      if ((packet2.buffer[i + 1] === Types$4.VAR_STRING || packet2.buffer[i + 1] === Types$4.NULL || packet2.buffer[i + 1] === Types$4.DOUBLE || packet2.buffer[i + 1] === Types$4.TINY || packet2.buffer[i + 1] === Types$4.DATETIME || packet2.buffer[i + 1] === Types$4.JSON) && packet2.buffer[i] === 1 && packet2.buffer[i + 2] === 0) {
        break;
      } else {
        packet2.readInt8();
      }
      i++;
    }
    const types2 = [];
    for (let i2 = packet2.offset + 1; i2 < packet2.end - 1; i2++) {
      if ((packet2.buffer[i2] === Types$4.VAR_STRING || packet2.buffer[i2] === Types$4.NULL || packet2.buffer[i2] === Types$4.DOUBLE || packet2.buffer[i2] === Types$4.TINY || packet2.buffer[i2] === Types$4.DATETIME || packet2.buffer[i2] === Types$4.JSON) && packet2.buffer[i2 + 1] === 0) {
        types2.push(packet2.buffer[i2]);
        packet2.skip(2);
      }
    }
    packet2.skip(1);
    const values = [];
    for (let i2 = 0; i2 < types2.length; i2++) {
      if (types2[i2] === Types$4.VAR_STRING) {
        values.push(packet2.readLengthCodedString(encoding));
      } else if (types2[i2] === Types$4.DOUBLE) {
        values.push(packet2.readDouble());
      } else if (types2[i2] === Types$4.TINY) {
        values.push(packet2.readInt8());
      } else if (types2[i2] === Types$4.DATETIME) {
        values.push(packet2.readDateTime());
      } else if (types2[i2] === Types$4.JSON) {
        values.push(JSON.parse(packet2.readLengthCodedString(encoding)));
      }
      if (types2[i2] === Types$4.NULL) {
        values.push(null);
      }
    }
    return { stmtId, flags, iterationCount, values };
  }
  toPacket() {
    let length2 = 14;
    let parameters;
    if (this.parameters && this.parameters.length > 0) {
      length2 += Math.floor((this.parameters.length + 7) / 8);
      length2 += 1;
      length2 += 2 * this.parameters.length;
      parameters = this.parameters.map(
        (value) => toParameter(value, this.encoding, this.timezone)
      );
      length2 += parameters.reduce(
        (accumulator, parameter) => accumulator + parameter.length,
        0
      );
    }
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$a(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeInt8(CommandCodes$2.STMT_EXECUTE);
    packet2.writeInt32(this.id);
    packet2.writeInt8(CursorType.NO_CURSOR);
    packet2.writeInt32(1);
    if (parameters) {
      let bitmap = 0;
      let bitValue = 1;
      parameters.forEach((parameter) => {
        if (parameter.type === Types$4.NULL) {
          bitmap += bitValue;
        }
        bitValue *= 2;
        if (bitValue === 256) {
          packet2.writeInt8(bitmap);
          bitmap = 0;
          bitValue = 1;
        }
      });
      if (bitValue !== 1) {
        packet2.writeInt8(bitmap);
      }
      packet2.writeInt8(1);
      parameters.forEach((parameter) => {
        packet2.writeInt8(parameter.type);
        packet2.writeInt8(0);
      });
      parameters.forEach((parameter) => {
        if (parameter.type !== Types$4.NULL) {
          parameter.writer.call(packet2, parameter.value);
        }
      });
    }
    return packet2;
  }
};
var execute$1 = Execute$3;
const Packet$9 = packet;
const ClientConstants$5 = client;
class Handshake {
  constructor(args) {
    this.protocolVersion = args.protocolVersion;
    this.serverVersion = args.serverVersion;
    this.capabilityFlags = args.capabilityFlags;
    this.connectionId = args.connectionId;
    this.authPluginData1 = args.authPluginData1;
    this.authPluginData2 = args.authPluginData2;
    this.characterSet = args.characterSet;
    this.statusFlags = args.statusFlags;
    this.authPluginName = args.authPluginName;
  }
  setScrambleData(cb) {
    require$$0$2.randomBytes(20, (err, data) => {
      if (err) {
        cb(err);
        return;
      }
      this.authPluginData1 = data.slice(0, 8);
      this.authPluginData2 = data.slice(8, 20);
      cb();
    });
  }
  toPacket(sequenceId) {
    const length2 = 68 + Buffer.byteLength(this.serverVersion, "utf8");
    const buffer = Buffer.alloc(length2 + 4, 0);
    const packet2 = new Packet$9(sequenceId, buffer, 0, length2 + 4);
    packet2.offset = 4;
    packet2.writeInt8(this.protocolVersion);
    packet2.writeString(this.serverVersion, "cesu8");
    packet2.writeInt8(0);
    packet2.writeInt32(this.connectionId);
    packet2.writeBuffer(this.authPluginData1);
    packet2.writeInt8(0);
    const capabilityFlagsBuffer = Buffer.allocUnsafe(4);
    capabilityFlagsBuffer.writeUInt32LE(this.capabilityFlags, 0);
    packet2.writeBuffer(capabilityFlagsBuffer.slice(0, 2));
    packet2.writeInt8(this.characterSet);
    packet2.writeInt16(this.statusFlags);
    packet2.writeBuffer(capabilityFlagsBuffer.slice(2, 4));
    packet2.writeInt8(21);
    packet2.skip(10);
    packet2.writeBuffer(this.authPluginData2);
    packet2.writeInt8(0);
    packet2.writeString("mysql_native_password", "latin1");
    packet2.writeInt8(0);
    return packet2;
  }
  static fromPacket(packet2) {
    const args = {};
    args.protocolVersion = packet2.readInt8();
    args.serverVersion = packet2.readNullTerminatedString("cesu8");
    args.connectionId = packet2.readInt32();
    args.authPluginData1 = packet2.readBuffer(8);
    packet2.skip(1);
    const capabilityFlagsBuffer = Buffer.allocUnsafe(4);
    capabilityFlagsBuffer[0] = packet2.readInt8();
    capabilityFlagsBuffer[1] = packet2.readInt8();
    if (packet2.haveMoreData()) {
      args.characterSet = packet2.readInt8();
      args.statusFlags = packet2.readInt16();
      capabilityFlagsBuffer[2] = packet2.readInt8();
      capabilityFlagsBuffer[3] = packet2.readInt8();
      args.capabilityFlags = capabilityFlagsBuffer.readUInt32LE(0);
      if (args.capabilityFlags & ClientConstants$5.PLUGIN_AUTH) {
        args.authPluginDataLength = packet2.readInt8();
      } else {
        args.authPluginDataLength = 0;
        packet2.skip(1);
      }
      packet2.skip(10);
    } else {
      args.capabilityFlags = capabilityFlagsBuffer.readUInt16LE(0);
    }
    const isSecureConnection = args.capabilityFlags & ClientConstants$5.SECURE_CONNECTION;
    if (isSecureConnection) {
      const authPluginDataLength = args.authPluginDataLength;
      if (authPluginDataLength === 0) {
        args.authPluginDataLength = 20;
        args.authPluginData2 = packet2.readBuffer(12);
        packet2.skip(1);
      } else {
        const len = Math.max(13, authPluginDataLength - 8);
        args.authPluginData2 = packet2.readBuffer(len);
      }
    }
    if (args.capabilityFlags & ClientConstants$5.PLUGIN_AUTH) {
      args.authPluginName = packet2.readNullTerminatedString("ascii");
    }
    return new Handshake(args);
  }
}
var handshake = Handshake;
const ClientConstants$4 = client;
const CharsetToEncoding$5 = requireCharset_encodings();
const Packet$8 = packet;
const auth41$2 = auth_41;
class HandshakeResponse {
  constructor(handshake2) {
    this.user = handshake2.user || "";
    this.database = handshake2.database || "";
    this.password = handshake2.password || "";
    this.passwordSha1 = handshake2.passwordSha1;
    this.authPluginData1 = handshake2.authPluginData1;
    this.authPluginData2 = handshake2.authPluginData2;
    this.compress = handshake2.compress;
    this.clientFlags = handshake2.flags;
    let authToken;
    if (this.passwordSha1) {
      authToken = auth41$2.calculateTokenFromPasswordSha(
        this.passwordSha1,
        this.authPluginData1,
        this.authPluginData2
      );
    } else {
      authToken = auth41$2.calculateToken(
        this.password,
        this.authPluginData1,
        this.authPluginData2
      );
    }
    this.authToken = authToken;
    this.charsetNumber = handshake2.charsetNumber;
    this.encoding = CharsetToEncoding$5[handshake2.charsetNumber];
    this.connectAttributes = handshake2.connectAttributes;
  }
  serializeResponse(buffer) {
    const isSet = (flag) => this.clientFlags & ClientConstants$4[flag];
    const packet2 = new Packet$8(0, buffer, 0, buffer.length);
    packet2.offset = 4;
    packet2.writeInt32(this.clientFlags);
    packet2.writeInt32(0);
    packet2.writeInt8(this.charsetNumber);
    packet2.skip(23);
    const encoding = this.encoding;
    packet2.writeNullTerminatedString(this.user, encoding);
    let k;
    if (isSet("PLUGIN_AUTH_LENENC_CLIENT_DATA")) {
      packet2.writeLengthCodedNumber(this.authToken.length);
      packet2.writeBuffer(this.authToken);
    } else if (isSet("SECURE_CONNECTION")) {
      packet2.writeInt8(this.authToken.length);
      packet2.writeBuffer(this.authToken);
    } else {
      packet2.writeBuffer(this.authToken);
      packet2.writeInt8(0);
    }
    if (isSet("CONNECT_WITH_DB")) {
      packet2.writeNullTerminatedString(this.database, encoding);
    }
    if (isSet("PLUGIN_AUTH")) {
      packet2.writeNullTerminatedString("mysql_native_password", "latin1");
    }
    if (isSet("CONNECT_ATTRS")) {
      const connectAttributes = this.connectAttributes || {};
      const attrNames = Object.keys(connectAttributes);
      let keysLength = 0;
      for (k = 0; k < attrNames.length; ++k) {
        keysLength += Packet$8.lengthCodedStringLength(attrNames[k], encoding);
        keysLength += Packet$8.lengthCodedStringLength(
          connectAttributes[attrNames[k]],
          encoding
        );
      }
      packet2.writeLengthCodedNumber(keysLength);
      for (k = 0; k < attrNames.length; ++k) {
        packet2.writeLengthCodedString(attrNames[k], encoding);
        packet2.writeLengthCodedString(
          connectAttributes[attrNames[k]],
          encoding
        );
      }
    }
    return packet2;
  }
  toPacket() {
    if (typeof this.user !== "string") {
      throw new Error('"user" connection config property must be a string');
    }
    if (typeof this.database !== "string") {
      throw new Error('"database" connection config property must be a string');
    }
    const p = this.serializeResponse(Packet$8.MockBuffer());
    return this.serializeResponse(Buffer.alloc(p.offset));
  }
  static fromPacket(packet2) {
    const args = {};
    args.clientFlags = packet2.readInt32();
    function isSet(flag) {
      return args.clientFlags & ClientConstants$4[flag];
    }
    args.maxPacketSize = packet2.readInt32();
    args.charsetNumber = packet2.readInt8();
    const encoding = CharsetToEncoding$5[args.charsetNumber];
    args.encoding = encoding;
    packet2.skip(23);
    args.user = packet2.readNullTerminatedString(encoding);
    let authTokenLength;
    if (isSet("PLUGIN_AUTH_LENENC_CLIENT_DATA")) {
      authTokenLength = packet2.readLengthCodedNumber(encoding);
      args.authToken = packet2.readBuffer(authTokenLength);
    } else if (isSet("SECURE_CONNECTION")) {
      authTokenLength = packet2.readInt8();
      args.authToken = packet2.readBuffer(authTokenLength);
    } else {
      args.authToken = packet2.readNullTerminatedString(encoding);
    }
    if (isSet("CONNECT_WITH_DB")) {
      args.database = packet2.readNullTerminatedString(encoding);
    }
    if (isSet("PLUGIN_AUTH")) {
      args.authPluginName = packet2.readNullTerminatedString(encoding);
    }
    if (isSet("CONNECT_ATTRS")) {
      const keysLength = packet2.readLengthCodedNumber(encoding);
      const keysEnd = packet2.offset + keysLength;
      const attrs = {};
      while (packet2.offset < keysEnd) {
        attrs[packet2.readLengthCodedString(encoding)] = packet2.readLengthCodedString(encoding);
      }
      args.connectAttributes = attrs;
    }
    return args;
  }
}
var handshake_response = HandshakeResponse;
const Packet$7 = packet;
const CommandCodes$1 = commands$1;
const StringParser$1 = string;
const CharsetToEncoding$4 = requireCharset_encodings();
class PrepareStatement {
  constructor(sql, charsetNumber) {
    this.query = sql;
    this.charsetNumber = charsetNumber;
    this.encoding = CharsetToEncoding$4[charsetNumber];
  }
  toPacket() {
    const buf = StringParser$1.encode(this.query, this.encoding);
    const length2 = 5 + buf.length;
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$7(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeInt8(CommandCodes$1.STMT_PREPARE);
    packet2.writeBuffer(buf);
    return packet2;
  }
}
var prepare_statement = PrepareStatement;
class PreparedStatementHeader {
  constructor(packet2) {
    packet2.skip(1);
    this.id = packet2.readInt32();
    this.fieldCount = packet2.readInt16();
    this.parameterCount = packet2.readInt16();
    packet2.skip(1);
    this.warningCount = packet2.readInt16();
  }
}
var prepared_statement_header = PreparedStatementHeader;
const Packet$6 = packet;
const CommandCode$3 = commands$1;
const StringParser = string;
const CharsetToEncoding$3 = requireCharset_encodings();
let Query$3 = class Query {
  constructor(sql, charsetNumber) {
    this.query = sql;
    this.charsetNumber = charsetNumber;
    this.encoding = CharsetToEncoding$3[charsetNumber];
  }
  toPacket() {
    const buf = StringParser.encode(this.query, this.encoding);
    const length2 = 5 + buf.length;
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$6(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeInt8(CommandCode$3.QUERY);
    packet2.writeBuffer(buf);
    return packet2;
  }
};
var query$1 = Query$3;
const Packet$5 = packet;
const CommandCodes = commands$1;
let RegisterSlave$2 = class RegisterSlave {
  constructor(opts) {
    this.serverId = opts.serverId || 0;
    this.slaveHostname = opts.slaveHostname || "";
    this.slaveUser = opts.slaveUser || "";
    this.slavePassword = opts.slavePassword || "";
    this.slavePort = opts.slavePort || 0;
    this.replicationRank = opts.replicationRank || 0;
    this.masterId = opts.masterId || 0;
  }
  toPacket() {
    const length2 = 15 + // TODO: should be ascii?
    Buffer.byteLength(this.slaveHostname, "utf8") + Buffer.byteLength(this.slaveUser, "utf8") + Buffer.byteLength(this.slavePassword, "utf8") + 3 + 4;
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$5(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeInt8(CommandCodes.REGISTER_SLAVE);
    packet2.writeInt32(this.serverId);
    packet2.writeInt8(Buffer.byteLength(this.slaveHostname, "utf8"));
    packet2.writeString(this.slaveHostname);
    packet2.writeInt8(Buffer.byteLength(this.slaveUser, "utf8"));
    packet2.writeString(this.slaveUser);
    packet2.writeInt8(Buffer.byteLength(this.slavePassword, "utf8"));
    packet2.writeString(this.slavePassword);
    packet2.writeInt16(this.slavePort);
    packet2.writeInt32(this.replicationRank);
    packet2.writeInt32(this.masterId);
    return packet2;
  }
};
var register_slave$1 = RegisterSlave$2;
var server_status = {};
server_status.SERVER_STATUS_IN_TRANS = 1;
server_status.SERVER_STATUS_AUTOCOMMIT = 2;
server_status.SERVER_MORE_RESULTS_EXISTS = 8;
server_status.SERVER_QUERY_NO_GOOD_INDEX_USED = 16;
server_status.SERVER_QUERY_NO_INDEX_USED = 32;
server_status.SERVER_STATUS_CURSOR_EXISTS = 64;
server_status.SERVER_STATUS_LAST_ROW_SENT = 128;
server_status.SERVER_STATUS_DB_DROPPED = 256;
server_status.SERVER_STATUS_NO_BACKSLASH_ESCAPES = 512;
server_status.SERVER_STATUS_METADATA_CHANGED = 1024;
server_status.SERVER_QUERY_WAS_SLOW = 2048;
server_status.SERVER_PS_OUT_PARAMS = 4096;
server_status.SERVER_STATUS_IN_TRANS_READONLY = 8192;
server_status.SERVER_SESSION_STATE_CHANGED = 16384;
var encoding_charset = {
  big5: 1,
  latin2: 2,
  dec8: 3,
  cp850: 4,
  latin1: 5,
  hp8: 6,
  koi8r: 7,
  swe7: 10,
  ascii: 11,
  eucjp: 12,
  sjis: 13,
  cp1251: 14,
  hebrew: 16,
  tis620: 18,
  euckr: 19,
  latin7: 20,
  koi8u: 22,
  gb2312: 24,
  greek: 25,
  cp1250: 26,
  gbk: 28,
  cp1257: 29,
  latin5: 30,
  armscii8: 32,
  cesu8: 33,
  ucs2: 35,
  cp866: 36,
  keybcs2: 37,
  macintosh: 38,
  macroman: 39,
  cp852: 40,
  utf8: 45,
  utf8mb4: 45,
  utf16: 54,
  utf16le: 56,
  cp1256: 57,
  utf32: 60,
  binary: 63,
  geostd8: 92,
  cp932: 95,
  eucjpms: 97,
  gb18030: 248,
  utf8mb3: 192
};
var session_track = {};
(function(exports) {
  exports.SYSTEM_VARIABLES = 0;
  exports.SCHEMA = 1;
  exports.STATE_CHANGE = 2;
  exports.STATE_GTIDS = 3;
  exports.TRANSACTION_CHARACTERISTICS = 4;
  exports.TRANSACTION_STATE = 5;
  exports.FIRST_KEY = exports.SYSTEM_VARIABLES;
  exports.LAST_KEY = exports.TRANSACTION_STATE;
})(session_track);
const Packet$4 = packet;
const ClientConstants$3 = client;
const ServerSatusFlags = server_status;
const EncodingToCharset = encoding_charset;
const sessionInfoTypes = session_track;
class ResultSetHeader {
  constructor(packet2, connection2) {
    const bigNumberStrings = connection2.config.bigNumberStrings;
    const encoding = connection2.serverEncoding;
    const flags = connection2._handshakePacket.capabilityFlags;
    const isSet = function(flag) {
      return flags & ClientConstants$3[flag];
    };
    if (packet2.buffer[packet2.offset] !== 0) {
      this.fieldCount = packet2.readLengthCodedNumber();
      if (this.fieldCount === null) {
        this.infileName = packet2.readString(void 0, encoding);
      }
      return;
    }
    this.fieldCount = packet2.readInt8();
    this.affectedRows = packet2.readLengthCodedNumber(bigNumberStrings);
    this.insertId = packet2.readLengthCodedNumberSigned(bigNumberStrings);
    this.info = "";
    if (isSet("PROTOCOL_41")) {
      this.serverStatus = packet2.readInt16();
      this.warningStatus = packet2.readInt16();
    } else if (isSet("TRANSACTIONS")) {
      this.serverStatus = packet2.readInt16();
    }
    let stateChanges = null;
    if (isSet("SESSION_TRACK") && packet2.offset < packet2.end) {
      this.info = packet2.readLengthCodedString(encoding);
      if (this.serverStatus && ServerSatusFlags.SERVER_SESSION_STATE_CHANGED) {
        let len = packet2.offset < packet2.end ? packet2.readLengthCodedNumber() : 0;
        const end = packet2.offset + len;
        let type, key, stateEnd;
        if (len > 0) {
          stateChanges = {
            systemVariables: {},
            schema: null,
            gtids: [],
            trackStateChange: null
          };
        }
        while (packet2.offset < end) {
          type = packet2.readInt8();
          len = packet2.readLengthCodedNumber();
          stateEnd = packet2.offset + len;
          if (type === sessionInfoTypes.SYSTEM_VARIABLES) {
            key = packet2.readLengthCodedString(encoding);
            const val = packet2.readLengthCodedString(encoding);
            stateChanges.systemVariables[key] = val;
            if (key === "character_set_client") {
              const charsetNumber = EncodingToCharset[val];
              if (typeof charsetNumber !== "undefined") {
                connection2.config.charsetNumber = charsetNumber;
              }
            }
          } else if (type === sessionInfoTypes.SCHEMA) {
            key = packet2.readLengthCodedString(encoding);
            stateChanges.schema = key;
          } else if (type === sessionInfoTypes.STATE_CHANGE) {
            stateChanges.trackStateChange = packet2.readLengthCodedString(encoding);
          } else if (type === sessionInfoTypes.STATE_GTIDS) {
            packet2.readLengthCodedString(encoding);
            const gtid = packet2.readLengthCodedString(encoding);
            stateChanges.gtids = gtid.split(",");
          } else ;
          packet2.offset = stateEnd;
        }
      }
    } else {
      this.info = packet2.readString(void 0, encoding);
    }
    if (stateChanges) {
      this.stateChanges = stateChanges;
    }
    const m = this.info.match(/\schanged:\s*(\d+)/i);
    if (m !== null) {
      this.changedRows = parseInt(m[1], 10);
    } else {
      this.changedRows = 0;
    }
  }
  // TODO: should be consistent instance member, but it's just easier here to have just function
  static toPacket(fieldCount, insertId) {
    let length2 = 4 + Packet$4.lengthCodedNumberLength(fieldCount);
    if (typeof insertId !== "undefined") {
      length2 += Packet$4.lengthCodedNumberLength(insertId);
    }
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$4(0, buffer, 0, length2);
    packet2.offset = 4;
    packet2.writeLengthCodedNumber(fieldCount);
    if (typeof insertId !== "undefined") {
      packet2.writeLengthCodedNumber(insertId);
    }
    return packet2;
  }
}
var resultset_header = ResultSetHeader;
const ClientConstants$2 = client;
const Packet$3 = packet;
class SSLRequest {
  constructor(flags, charset) {
    this.clientFlags = flags | ClientConstants$2.SSL;
    this.charset = charset;
  }
  toPacket() {
    const length2 = 36;
    const buffer = Buffer.allocUnsafe(length2);
    const packet2 = new Packet$3(0, buffer, 0, length2);
    buffer.fill(0);
    packet2.offset = 4;
    packet2.writeInt32(this.clientFlags);
    packet2.writeInt32(0);
    packet2.writeInt8(this.charset);
    return packet2;
  }
}
var ssl_request = SSLRequest;
const Packet$2 = packet;
class TextRow {
  constructor(columns) {
    this.columns = columns || [];
  }
  static fromPacket(packet2) {
    const columns = [];
    while (packet2.haveMoreData()) {
      columns.push(packet2.readLengthCodedString());
    }
    return new TextRow(columns);
  }
  static toPacket(columns, encoding) {
    const sequenceId = 0;
    let length2 = 0;
    columns.forEach((val) => {
      if (val === null || typeof val === "undefined") {
        ++length2;
        return;
      }
      length2 += Packet$2.lengthCodedStringLength(val.toString(10), encoding);
    });
    const buffer = Buffer.allocUnsafe(length2 + 4);
    const packet2 = new Packet$2(sequenceId, buffer, 0, length2 + 4);
    packet2.offset = 4;
    columns.forEach((val) => {
      if (val === null) {
        packet2.writeNull();
        return;
      }
      if (typeof val === "undefined") {
        packet2.writeInt8(0);
        return;
      }
      packet2.writeLengthCodedString(val.toString(10), encoding);
    });
    return packet2;
  }
}
var text_row = TextRow;
(function(module, exports) {
  const process2 = require$$0$3;
  const AuthNextFactor2 = auth_next_factor;
  const AuthSwitchRequest2 = auth_switch_request;
  const AuthSwitchRequestMoreData2 = auth_switch_request_more_data;
  const AuthSwitchResponse2 = auth_switch_response;
  const BinaryRow2 = binary_row;
  const BinlogDump4 = binlog_dump$1;
  const ChangeUser4 = change_user$1;
  const CloseStatement4 = close_statement$1;
  const ColumnDefinition2 = column_definition;
  const Execute4 = execute$1;
  const Handshake2 = handshake;
  const HandshakeResponse2 = handshake_response;
  const PrepareStatement2 = prepare_statement;
  const PreparedStatementHeader2 = prepared_statement_header;
  const Query4 = query$1;
  const RegisterSlave4 = register_slave$1;
  const ResultSetHeader2 = resultset_header;
  const SSLRequest2 = ssl_request;
  const TextRow2 = text_row;
  const ctorMap = {
    AuthNextFactor: AuthNextFactor2,
    AuthSwitchRequest: AuthSwitchRequest2,
    AuthSwitchRequestMoreData: AuthSwitchRequestMoreData2,
    AuthSwitchResponse: AuthSwitchResponse2,
    BinaryRow: BinaryRow2,
    BinlogDump: BinlogDump4,
    ChangeUser: ChangeUser4,
    CloseStatement: CloseStatement4,
    ColumnDefinition: ColumnDefinition2,
    Execute: Execute4,
    Handshake: Handshake2,
    HandshakeResponse: HandshakeResponse2,
    PrepareStatement: PrepareStatement2,
    PreparedStatementHeader: PreparedStatementHeader2,
    Query: Query4,
    RegisterSlave: RegisterSlave4,
    ResultSetHeader: ResultSetHeader2,
    SSLRequest: SSLRequest2,
    TextRow: TextRow2
  };
  Object.entries(ctorMap).forEach(([name, ctor]) => {
    module.exports[name] = ctor;
    if (process2.env.NODE_DEBUG) {
      if (ctor.prototype.toPacket) {
        const old = ctor.prototype.toPacket;
        ctor.prototype.toPacket = function() {
          const p = old.call(this);
          p._name = name;
          return p;
        };
      }
    }
  });
  const Packet3 = packet;
  exports.Packet = Packet3;
  class OK {
    static toPacket(args, encoding) {
      args = args || {};
      const affectedRows = args.affectedRows || 0;
      const insertId = args.insertId || 0;
      const serverStatus = args.serverStatus || 0;
      const warningCount = args.warningCount || 0;
      const message = args.message || "";
      let length2 = 9 + Packet3.lengthCodedNumberLength(affectedRows);
      length2 += Packet3.lengthCodedNumberLength(insertId);
      const buffer = Buffer.allocUnsafe(length2);
      const packet2 = new Packet3(0, buffer, 0, length2);
      packet2.offset = 4;
      packet2.writeInt8(0);
      packet2.writeLengthCodedNumber(affectedRows);
      packet2.writeLengthCodedNumber(insertId);
      packet2.writeInt16(serverStatus);
      packet2.writeInt16(warningCount);
      packet2.writeString(message, encoding);
      packet2._name = "OK";
      return packet2;
    }
  }
  exports.OK = OK;
  class EOF {
    static toPacket(warnings, statusFlags) {
      if (typeof warnings === "undefined") {
        warnings = 0;
      }
      if (typeof statusFlags === "undefined") {
        statusFlags = 0;
      }
      const packet2 = new Packet3(0, Buffer.allocUnsafe(9), 0, 9);
      packet2.offset = 4;
      packet2.writeInt8(254);
      packet2.writeInt16(warnings);
      packet2.writeInt16(statusFlags);
      packet2._name = "EOF";
      return packet2;
    }
  }
  exports.EOF = EOF;
  class Error2 {
    static toPacket(args, encoding) {
      const length2 = 13 + Buffer.byteLength(args.message, "utf8");
      const packet2 = new Packet3(0, Buffer.allocUnsafe(length2), 0, length2);
      packet2.offset = 4;
      packet2.writeInt8(255);
      packet2.writeInt16(args.code);
      packet2.writeString("#_____", encoding);
      packet2.writeString(args.message, encoding);
      packet2._name = "Error";
      return packet2;
    }
    static fromPacket(packet2) {
      packet2.readInt8();
      const code = packet2.readInt16();
      packet2.readString(1, "ascii");
      packet2.readString(5, "ascii");
      const message = packet2.readNullTerminatedString("utf8");
      const error = new Error2();
      error.message = message;
      error.code = code;
      return error;
    }
  }
  exports.Error = Error2;
})(packets, packets.exports);
var packetsExports = packets.exports;
const EventEmitter$3 = require$$0$4.EventEmitter;
const Timers$2 = require$$1;
let Command$b = class Command extends EventEmitter$3 {
  constructor() {
    super();
    this.next = null;
  }
  // slow. debug only
  stateName() {
    const state = this.next;
    for (const i in this) {
      if (this[i] === state && i !== "next") {
        return i;
      }
    }
    return "unknown name";
  }
  execute(packet2, connection2) {
    if (!this.next) {
      this.next = this.start;
      connection2._resetSequenceId();
    }
    if (packet2 && packet2.isError()) {
      const err = packet2.asError(connection2.clientEncoding);
      err.sql = this.sql || this.query;
      if (this.queryTimeout) {
        Timers$2.clearTimeout(this.queryTimeout);
        this.queryTimeout = null;
      }
      if (this.onResult) {
        this.onResult(err);
        this.emit("end");
      } else {
        this.emit("error", err);
        this.emit("end");
      }
      return true;
    }
    this.next = this.next(packet2, connection2);
    if (this.next) {
      return false;
    }
    this.emit("end");
    return true;
  }
};
var command = Command$b;
const PLUGIN_NAME$1 = "sha256_password";
const crypto$1 = require$$0$2;
const { xorRotating: xorRotating$1 } = auth_41;
const REQUEST_SERVER_KEY_PACKET$1 = Buffer.from([1]);
const STATE_INITIAL$1 = 0;
const STATE_WAIT_SERVER_KEY$1 = 1;
const STATE_FINAL$1 = -1;
function encrypt$1(password, scramble, key) {
  const stage1 = xorRotating$1(Buffer.from(`${password}\0`, "utf8"), scramble);
  return crypto$1.publicEncrypt(key, stage1);
}
var sha256_password = (pluginOptions = {}) => ({ connection: connection2 }) => {
  let state = 0;
  let scramble = null;
  const password = connection2.config.password;
  const authWithKey = (serverKey) => {
    const _password = encrypt$1(password, scramble, serverKey);
    state = STATE_FINAL$1;
    return _password;
  };
  return (data) => {
    switch (state) {
      case STATE_INITIAL$1:
        scramble = data.slice(0, 20);
        if (pluginOptions.serverPublicKey) {
          return authWithKey(pluginOptions.serverPublicKey);
        }
        state = STATE_WAIT_SERVER_KEY$1;
        return REQUEST_SERVER_KEY_PACKET$1;
      case STATE_WAIT_SERVER_KEY$1:
        if (pluginOptions.onServerPublicKey) {
          pluginOptions.onServerPublicKey(data);
        }
        return authWithKey(data);
      case STATE_FINAL$1:
        throw new Error(
          `Unexpected data in AuthMoreData packet received by ${PLUGIN_NAME$1} plugin in STATE_FINAL state.`
        );
    }
    throw new Error(
      `Unexpected data in AuthMoreData packet received by ${PLUGIN_NAME$1} plugin in state ${state}`
    );
  };
};
const PLUGIN_NAME = "caching_sha2_password";
const crypto = require$$0$2;
const { xor, xorRotating } = auth_41;
const REQUEST_SERVER_KEY_PACKET = Buffer.from([2]);
const FAST_AUTH_SUCCESS_PACKET = Buffer.from([3]);
const PERFORM_FULL_AUTHENTICATION_PACKET = Buffer.from([4]);
const STATE_INITIAL = 0;
const STATE_TOKEN_SENT = 1;
const STATE_WAIT_SERVER_KEY = 2;
const STATE_FINAL = -1;
function sha256(msg) {
  const hash = crypto.createHash("sha256");
  hash.update(msg);
  return hash.digest();
}
function calculateToken(password, scramble) {
  if (!password) {
    return Buffer.alloc(0);
  }
  const stage1 = sha256(Buffer.from(password));
  const stage2 = sha256(stage1);
  const stage3 = sha256(Buffer.concat([stage2, scramble]));
  return xor(stage1, stage3);
}
function encrypt(password, scramble, key) {
  const stage1 = xorRotating(Buffer.from(`${password}\0`, "utf8"), scramble);
  return crypto.publicEncrypt(
    {
      key,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    },
    stage1
  );
}
var caching_sha2_password = (pluginOptions = {}) => ({ connection: connection2 }) => {
  let state = 0;
  let scramble = null;
  const password = connection2.config.password;
  const authWithKey = (serverKey) => {
    const _password = encrypt(password, scramble, serverKey);
    state = STATE_FINAL;
    return _password;
  };
  return (data) => {
    switch (state) {
      case STATE_INITIAL:
        scramble = data.slice(0, 20);
        state = STATE_TOKEN_SENT;
        return calculateToken(password, scramble);
      case STATE_TOKEN_SENT:
        if (FAST_AUTH_SUCCESS_PACKET.equals(data)) {
          state = STATE_FINAL;
          return null;
        }
        if (PERFORM_FULL_AUTHENTICATION_PACKET.equals(data)) {
          const isSecureConnection = typeof pluginOptions.overrideIsSecure === "undefined" ? connection2.config.ssl || connection2.config.socketPath : pluginOptions.overrideIsSecure;
          if (isSecureConnection) {
            state = STATE_FINAL;
            return Buffer.from(`${password}\0`, "utf8");
          }
          if (pluginOptions.serverPublicKey) {
            return authWithKey(pluginOptions.serverPublicKey);
          }
          state = STATE_WAIT_SERVER_KEY;
          return REQUEST_SERVER_KEY_PACKET;
        }
        throw new Error(
          `Invalid AuthMoreData packet received by ${PLUGIN_NAME} plugin in STATE_TOKEN_SENT state.`
        );
      case STATE_WAIT_SERVER_KEY:
        if (pluginOptions.onServerPublicKey) {
          pluginOptions.onServerPublicKey(data);
        }
        return authWithKey(data);
      case STATE_FINAL:
        throw new Error(
          `Unexpected data in AuthMoreData packet received by ${PLUGIN_NAME} plugin in STATE_FINAL state.`
        );
    }
    throw new Error(
      `Unexpected data in AuthMoreData packet received by ${PLUGIN_NAME} plugin in state ${state}`
    );
  };
};
const auth41$1 = auth_41;
var mysql_native_password = (pluginOptions) => ({ connection: connection2, command: command2 }) => {
  const password = command2.password || pluginOptions.password || connection2.config.password;
  const passwordSha1 = command2.passwordSha1 || pluginOptions.passwordSha1 || connection2.config.passwordSha1;
  return (data) => {
    const authPluginData1 = data.slice(0, 8);
    const authPluginData2 = data.slice(8, 20);
    let authToken;
    if (passwordSha1) {
      authToken = auth41$1.calculateTokenFromPasswordSha(
        passwordSha1,
        authPluginData1,
        authPluginData2
      );
    } else {
      authToken = auth41$1.calculateToken(
        password,
        authPluginData1,
        authPluginData2
      );
    }
    return authToken;
  };
};
function bufferFromStr(str) {
  return Buffer.from(`${str}\0`);
}
const create_mysql_clear_password_plugin = (pluginOptions) => function mysql_clear_password_plugin({ connection: connection2, command: command2 }) {
  const password = command2.password || pluginOptions.password || connection2.config.password;
  return function() {
    return bufferFromStr(password);
  };
};
var mysql_clear_password = create_mysql_clear_password_plugin;
var auth_switch;
var hasRequiredAuth_switch;
function requireAuth_switch() {
  if (hasRequiredAuth_switch) return auth_switch;
  hasRequiredAuth_switch = 1;
  const Packets2 = packetsExports;
  const sha256_password$1 = sha256_password;
  const caching_sha2_password$1 = caching_sha2_password;
  const mysql_native_password$1 = mysql_native_password;
  const mysql_clear_password$1 = mysql_clear_password;
  const standardAuthPlugins = {
    sha256_password: sha256_password$1({}),
    caching_sha2_password: caching_sha2_password$1({}),
    mysql_native_password: mysql_native_password$1({}),
    mysql_clear_password: mysql_clear_password$1({})
  };
  function warnLegacyAuthSwitch() {
    console.warn(
      "WARNING! authSwitchHandler api is deprecated, please use new authPlugins api"
    );
  }
  function authSwitchPluginError(error, command2) {
    error.code = "AUTH_SWITCH_PLUGIN_ERROR";
    error.fatal = true;
    command2.emit("error", error);
  }
  function authSwitchRequest(packet2, connection2, command2) {
    const { pluginName, pluginData } = Packets2.AuthSwitchRequest.fromPacket(packet2);
    let authPlugin = connection2.config.authPlugins && connection2.config.authPlugins[pluginName];
    if (connection2.config.authSwitchHandler && pluginName !== "mysql_native_password") {
      const legacySwitchHandler = connection2.config.authSwitchHandler;
      warnLegacyAuthSwitch();
      legacySwitchHandler({ pluginName, pluginData }, (err, data) => {
        if (err) {
          return authSwitchPluginError(err, command2);
        }
        connection2.writePacket(new Packets2.AuthSwitchResponse(data).toPacket());
      });
      return;
    }
    if (!authPlugin) {
      authPlugin = standardAuthPlugins[pluginName];
    }
    if (!authPlugin) {
      throw new Error(
        `Server requests authentication using unknown plugin ${pluginName}. See ${"TODO: add plugins doco here"} on how to configure or author authentication plugins.`
      );
    }
    connection2._authPlugin = authPlugin({ connection: connection2, command: command2 });
    Promise.resolve(connection2._authPlugin(pluginData)).then((data) => {
      if (data) {
        connection2.writePacket(new Packets2.AuthSwitchResponse(data).toPacket());
      }
    }).catch((err) => {
      authSwitchPluginError(err, command2);
    });
  }
  function authSwitchRequestMoreData(packet2, connection2, command2) {
    const { data } = Packets2.AuthSwitchRequestMoreData.fromPacket(packet2);
    if (connection2.config.authSwitchHandler) {
      const legacySwitchHandler = connection2.config.authSwitchHandler;
      warnLegacyAuthSwitch();
      legacySwitchHandler({ pluginData: data }, (err, data2) => {
        if (err) {
          return authSwitchPluginError(err, command2);
        }
        connection2.writePacket(new Packets2.AuthSwitchResponse(data2).toPacket());
      });
      return;
    }
    if (!connection2._authPlugin) {
      throw new Error(
        "AuthPluginMoreData received but no auth plugin instance found"
      );
    }
    Promise.resolve(connection2._authPlugin(data)).then((data2) => {
      if (data2) {
        connection2.writePacket(new Packets2.AuthSwitchResponse(data2).toPacket());
      }
    }).catch((err) => {
      authSwitchPluginError(err, command2);
    });
  }
  auth_switch = {
    authSwitchRequest,
    authSwitchRequestMoreData
  };
  return auth_switch;
}
var seqQueue$1 = { exports: {} };
var hasRequiredSeqQueue$1;
function requireSeqQueue$1() {
  if (hasRequiredSeqQueue$1) return seqQueue$1.exports;
  hasRequiredSeqQueue$1 = 1;
  (function(module) {
    var EventEmitter2 = require$$0$4.EventEmitter;
    var util2 = require$$0$5;
    var DEFAULT_TIMEOUT = 3e3;
    var INIT_ID = 0;
    var EVENT_CLOSED = "closed";
    var EVENT_DRAINED = "drained";
    var SeqQueue = function(timeout) {
      EventEmitter2.call(this);
      if (timeout && timeout > 0) {
        this.timeout = timeout;
      } else {
        this.timeout = DEFAULT_TIMEOUT;
      }
      this.status = SeqQueueManager.STATUS_IDLE;
      this.curId = INIT_ID;
      this.queue = [];
    };
    util2.inherits(SeqQueue, EventEmitter2);
    SeqQueue.prototype.push = function(fn, ontimeout, timeout) {
      if (this.status !== SeqQueueManager.STATUS_IDLE && this.status !== SeqQueueManager.STATUS_BUSY) {
        return false;
      }
      if (typeof fn !== "function") {
        throw new Error("fn should be a function.");
      }
      this.queue.push({ fn, ontimeout, timeout });
      if (this.status === SeqQueueManager.STATUS_IDLE) {
        this.status = SeqQueueManager.STATUS_BUSY;
        var self2 = this;
        process.nextTick(function() {
          self2._next(self2.curId);
        });
      }
      return true;
    };
    SeqQueue.prototype.close = function(force) {
      if (this.status !== SeqQueueManager.STATUS_IDLE && this.status !== SeqQueueManager.STATUS_BUSY) {
        return;
      }
      if (force) {
        this.status = SeqQueueManager.STATUS_DRAINED;
        if (this.timerId) {
          clearTimeout(this.timerId);
          this.timerId = void 0;
        }
        this.emit(EVENT_DRAINED);
      } else {
        this.status = SeqQueueManager.STATUS_CLOSED;
        this.emit(EVENT_CLOSED);
      }
    };
    SeqQueue.prototype._next = function(tid) {
      if (tid !== this.curId || this.status !== SeqQueueManager.STATUS_BUSY && this.status !== SeqQueueManager.STATUS_CLOSED) {
        return;
      }
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = void 0;
      }
      var task = this.queue.shift();
      if (!task) {
        if (this.status === SeqQueueManager.STATUS_BUSY) {
          this.status = SeqQueueManager.STATUS_IDLE;
          this.curId++;
        } else {
          this.status = SeqQueueManager.STATUS_DRAINED;
          this.emit(EVENT_DRAINED);
        }
        return;
      }
      var self2 = this;
      task.id = ++this.curId;
      var timeout = task.timeout > 0 ? task.timeout : this.timeout;
      timeout = timeout > 0 ? timeout : DEFAULT_TIMEOUT;
      this.timerId = setTimeout(function() {
        process.nextTick(function() {
          self2._next(task.id);
        });
        self2.emit("timeout", task);
        if (task.ontimeout) {
          task.ontimeout();
        }
      }, timeout);
      try {
        task.fn({
          done: function() {
            var res = task.id === self2.curId;
            process.nextTick(function() {
              self2._next(task.id);
            });
            return res;
          }
        });
      } catch (err) {
        self2.emit("error", err, task);
        process.nextTick(function() {
          self2._next(task.id);
        });
      }
    };
    var SeqQueueManager = module.exports;
    SeqQueueManager.STATUS_IDLE = 0;
    SeqQueueManager.STATUS_BUSY = 1;
    SeqQueueManager.STATUS_CLOSED = 2;
    SeqQueueManager.STATUS_DRAINED = 3;
    SeqQueueManager.createQueue = function(timeout) {
      return new SeqQueue(timeout);
    };
  })(seqQueue$1);
  return seqQueue$1.exports;
}
var seqQueue;
var hasRequiredSeqQueue;
function requireSeqQueue() {
  if (hasRequiredSeqQueue) return seqQueue;
  hasRequiredSeqQueue = 1;
  seqQueue = requireSeqQueue$1();
  return seqQueue;
}
var compressed_protocol;
var hasRequiredCompressed_protocol;
function requireCompressed_protocol() {
  if (hasRequiredCompressed_protocol) return compressed_protocol;
  hasRequiredCompressed_protocol = 1;
  const zlib = require$$6;
  const PacketParser3 = packet_parser;
  function handleCompressedPacket(packet2) {
    const connection2 = this;
    const deflatedLength = packet2.readInt24();
    const body = packet2.readBuffer();
    if (deflatedLength !== 0) {
      connection2.inflateQueue.push((task) => {
        zlib.inflate(body, (err, data) => {
          if (err) {
            connection2._handleNetworkError(err);
            return;
          }
          connection2._bumpCompressedSequenceId(packet2.numPackets);
          connection2._inflatedPacketsParser.execute(data);
          task.done();
        });
      });
    } else {
      connection2.inflateQueue.push((task) => {
        connection2._bumpCompressedSequenceId(packet2.numPackets);
        connection2._inflatedPacketsParser.execute(body);
        task.done();
      });
    }
  }
  function writeCompressed(buffer) {
    const MAX_COMPRESSED_LENGTH = 16777210;
    let start;
    if (buffer.length > MAX_COMPRESSED_LENGTH) {
      for (start = 0; start < buffer.length; start += MAX_COMPRESSED_LENGTH) {
        writeCompressed.call(
          // eslint-disable-next-line no-invalid-this
          this,
          buffer.slice(start, start + MAX_COMPRESSED_LENGTH)
        );
      }
      return;
    }
    const connection2 = this;
    let packetLen = buffer.length;
    const compressHeader = Buffer.allocUnsafe(7);
    (function(seqId) {
      connection2.deflateQueue.push((task) => {
        zlib.deflate(buffer, (err, compressed) => {
          if (err) {
            connection2._handleFatalError(err);
            return;
          }
          let compressedLength = compressed.length;
          if (compressedLength < packetLen) {
            compressHeader.writeUInt8(compressedLength & 255, 0);
            compressHeader.writeUInt16LE(compressedLength >> 8, 1);
            compressHeader.writeUInt8(seqId, 3);
            compressHeader.writeUInt8(packetLen & 255, 4);
            compressHeader.writeUInt16LE(packetLen >> 8, 5);
            connection2.writeUncompressed(compressHeader);
            connection2.writeUncompressed(compressed);
          } else {
            compressedLength = packetLen;
            packetLen = 0;
            compressHeader.writeUInt8(compressedLength & 255, 0);
            compressHeader.writeUInt16LE(compressedLength >> 8, 1);
            compressHeader.writeUInt8(seqId, 3);
            compressHeader.writeUInt8(packetLen & 255, 4);
            compressHeader.writeUInt16LE(packetLen >> 8, 5);
            connection2.writeUncompressed(compressHeader);
            connection2.writeUncompressed(buffer);
          }
          task.done();
        });
      });
    })(connection2.compressedSequenceId);
    connection2._bumpCompressedSequenceId(1);
  }
  function enableCompression(connection2) {
    connection2._lastWrittenPacketId = 0;
    connection2._lastReceivedPacketId = 0;
    connection2._handleCompressedPacket = handleCompressedPacket;
    connection2._inflatedPacketsParser = new PacketParser3((p) => {
      connection2.handlePacket(p);
    }, 4);
    connection2._inflatedPacketsParser._lastPacket = 0;
    connection2.packetParser = new PacketParser3((packet2) => {
      connection2._handleCompressedPacket(packet2);
    }, 7);
    connection2.writeUncompressed = connection2.write;
    connection2.write = writeCompressed;
    const seqqueue = requireSeqQueue();
    connection2.inflateQueue = seqqueue.createQueue();
    connection2.deflateQueue = seqqueue.createQueue();
  }
  compressed_protocol = {
    enableCompression
  };
  return compressed_protocol;
}
const Command$a = command;
const Packets$9 = packetsExports;
const ClientConstants$1 = client;
const CharsetToEncoding$2 = requireCharset_encodings();
const auth41 = auth_41;
function flagNames(flags) {
  const res = [];
  for (const c in ClientConstants$1) {
    if (flags & ClientConstants$1[c]) {
      res.push(c.replace(/_/g, " ").toLowerCase());
    }
  }
  return res;
}
let ClientHandshake$2 = class ClientHandshake extends Command$a {
  constructor(clientFlags) {
    super();
    this.handshake = null;
    this.clientFlags = clientFlags;
    this.authenticationFactor = 0;
  }
  start() {
    return ClientHandshake.prototype.handshakeInit;
  }
  sendSSLRequest(connection2) {
    const sslRequest = new Packets$9.SSLRequest(
      this.clientFlags,
      connection2.config.charsetNumber
    );
    connection2.writePacket(sslRequest.toPacket());
  }
  sendCredentials(connection2) {
    if (connection2.config.debug) {
      console.log(
        "Sending handshake packet: flags:%d=(%s)",
        this.clientFlags,
        flagNames(this.clientFlags).join(", ")
      );
    }
    this.user = connection2.config.user;
    this.password = connection2.config.password;
    this.password1 = connection2.config.password;
    this.password2 = connection2.config.password2;
    this.password3 = connection2.config.password3;
    this.passwordSha1 = connection2.config.passwordSha1;
    this.database = connection2.config.database;
    this.authPluginName = this.handshake.authPluginName;
    const handshakeResponse = new Packets$9.HandshakeResponse({
      flags: this.clientFlags,
      user: this.user,
      database: this.database,
      password: this.password,
      passwordSha1: this.passwordSha1,
      charsetNumber: connection2.config.charsetNumber,
      authPluginData1: this.handshake.authPluginData1,
      authPluginData2: this.handshake.authPluginData2,
      compress: connection2.config.compress,
      connectAttributes: connection2.config.connectAttributes
    });
    connection2.writePacket(handshakeResponse.toPacket());
  }
  calculateNativePasswordAuthToken(authPluginData) {
    const authPluginData1 = authPluginData.slice(0, 8);
    const authPluginData2 = authPluginData.slice(8, 20);
    let authToken;
    if (this.passwordSha1) {
      authToken = auth41.calculateTokenFromPasswordSha(
        this.passwordSha1,
        authPluginData1,
        authPluginData2
      );
    } else {
      authToken = auth41.calculateToken(
        this.password,
        authPluginData1,
        authPluginData2
      );
    }
    return authToken;
  }
  handshakeInit(helloPacket, connection2) {
    this.on("error", (e) => {
      connection2._fatalError = e;
      connection2._protocolError = e;
    });
    this.handshake = Packets$9.Handshake.fromPacket(helloPacket);
    if (connection2.config.debug) {
      console.log(
        "Server hello packet: capability flags:%d=(%s)",
        this.handshake.capabilityFlags,
        flagNames(this.handshake.capabilityFlags).join(", ")
      );
    }
    connection2.serverCapabilityFlags = this.handshake.capabilityFlags;
    connection2.serverEncoding = CharsetToEncoding$2[this.handshake.characterSet];
    connection2.connectionId = this.handshake.connectionId;
    const serverSSLSupport = this.handshake.capabilityFlags & ClientConstants$1.SSL;
    const multiFactorAuthentication = this.handshake.capabilityFlags & ClientConstants$1.MULTI_FACTOR_AUTHENTICATION;
    this.clientFlags = this.clientFlags | multiFactorAuthentication;
    connection2.config.compress = connection2.config.compress && this.handshake.capabilityFlags & ClientConstants$1.COMPRESS;
    this.clientFlags = this.clientFlags | connection2.config.compress;
    if (connection2.config.ssl) {
      if (!serverSSLSupport) {
        const err = new Error("Server does not support secure connection");
        err.code = "HANDSHAKE_NO_SSL_SUPPORT";
        err.fatal = true;
        this.emit("error", err);
        return false;
      }
      this.clientFlags |= ClientConstants$1.SSL;
      this.sendSSLRequest(connection2);
      connection2.startTLS((err) => {
        if (err) {
          err.code = "HANDSHAKE_SSL_ERROR";
          err.fatal = true;
          this.emit("error", err);
          return;
        }
        this.sendCredentials(connection2);
      });
    } else {
      this.sendCredentials(connection2);
    }
    if (multiFactorAuthentication) {
      this.authenticationFactor = 1;
    }
    return ClientHandshake.prototype.handshakeResult;
  }
  handshakeResult(packet2, connection2) {
    const marker = packet2.peekByte();
    if (marker === 254 || marker === 1 || marker === 2) {
      const authSwitch = requireAuth_switch();
      try {
        if (marker === 1) {
          authSwitch.authSwitchRequestMoreData(packet2, connection2, this);
        } else {
          if (this.authenticationFactor !== 0) {
            connection2.config.password = this[`password${this.authenticationFactor}`];
            this.authenticationFactor += 1;
          }
          authSwitch.authSwitchRequest(packet2, connection2, this);
        }
        return ClientHandshake.prototype.handshakeResult;
      } catch (err) {
        err.code = "AUTH_SWITCH_PLUGIN_ERROR";
        err.fatal = true;
        if (this.onResult) {
          this.onResult(err);
        } else {
          this.emit("error", err);
        }
        return null;
      }
    }
    if (marker !== 0) {
      const err = new Error("Unexpected packet during handshake phase");
      err.code = "HANDSHAKE_UNKNOWN_ERROR";
      err.fatal = true;
      if (this.onResult) {
        this.onResult(err);
      } else {
        this.emit("error", err);
      }
      return null;
    }
    if (!connection2.authorized) {
      connection2.authorized = true;
      if (connection2.config.compress) {
        const enableCompression = requireCompressed_protocol().enableCompression;
        enableCompression(connection2);
      }
    }
    if (this.onResult) {
      this.onResult(null);
    }
    return null;
  }
};
var client_handshake = ClientHandshake$2;
const CommandCode$2 = commands$1;
const Errors = errors;
const Command$9 = command;
const Packets$8 = packetsExports;
let ServerHandshake$1 = class ServerHandshake extends Command$9 {
  constructor(args) {
    super();
    this.args = args;
  }
  start(packet2, connection2) {
    const serverHelloPacket = new Packets$8.Handshake(this.args);
    this.serverHello = serverHelloPacket;
    serverHelloPacket.setScrambleData((err) => {
      if (err) {
        connection2.emit("error", new Error("Error generating random bytes"));
        return;
      }
      connection2.writePacket(serverHelloPacket.toPacket(0));
    });
    return ServerHandshake.prototype.readClientReply;
  }
  readClientReply(packet2, connection2) {
    const clientHelloReply = Packets$8.HandshakeResponse.fromPacket(packet2);
    connection2.clientHelloReply = clientHelloReply;
    if (this.args.authCallback) {
      this.args.authCallback(
        {
          user: clientHelloReply.user,
          database: clientHelloReply.database,
          address: connection2.stream.remoteAddress,
          authPluginData1: this.serverHello.authPluginData1,
          authPluginData2: this.serverHello.authPluginData2,
          authToken: clientHelloReply.authToken
        },
        (err, mysqlError) => {
          if (!mysqlError) {
            connection2.writeOk();
          } else {
            connection2.writeError({
              message: mysqlError.message || "",
              code: mysqlError.code || 1045
            });
            connection2.close();
          }
        }
      );
    } else {
      connection2.writeOk();
    }
    return ServerHandshake.prototype.dispatchCommands;
  }
  _isStatement(query2, name) {
    const firstWord = query2.split(" ")[0].toUpperCase();
    return firstWord === name;
  }
  dispatchCommands(packet2, connection2) {
    let knownCommand = true;
    const encoding = connection2.clientHelloReply.encoding;
    const commandCode = packet2.readInt8();
    switch (commandCode) {
      case CommandCode$2.STMT_PREPARE:
        if (connection2.listeners("stmt_prepare").length) {
          const query2 = packet2.readString(void 0, encoding);
          connection2.emit("stmt_prepare", query2);
        } else {
          connection2.writeError({
            code: Errors.HA_ERR_INTERNAL_ERROR,
            message: "No query handler for prepared statements."
          });
        }
        break;
      case CommandCode$2.STMT_EXECUTE:
        if (connection2.listeners("stmt_execute").length) {
          const { stmtId, flags, iterationCount, values } = Packets$8.Execute.fromPacket(packet2, encoding);
          connection2.emit(
            "stmt_execute",
            stmtId,
            flags,
            iterationCount,
            values
          );
        } else {
          connection2.writeError({
            code: Errors.HA_ERR_INTERNAL_ERROR,
            message: "No query handler for execute statements."
          });
        }
        break;
      case CommandCode$2.QUIT:
        if (connection2.listeners("quit").length) {
          connection2.emit("quit");
        } else {
          connection2.stream.end();
        }
        break;
      case CommandCode$2.INIT_DB:
        if (connection2.listeners("init_db").length) {
          const schemaName = packet2.readString(void 0, encoding);
          connection2.emit("init_db", schemaName);
        } else {
          connection2.writeOk();
        }
        break;
      case CommandCode$2.QUERY:
        if (connection2.listeners("query").length) {
          const query2 = packet2.readString(void 0, encoding);
          if (this._isStatement(query2, "PREPARE") || this._isStatement(query2, "SET")) {
            connection2.emit("stmt_prepare", query2);
          } else if (this._isStatement(query2, "EXECUTE")) {
            connection2.emit("stmt_execute", null, null, null, null, query2);
          } else connection2.emit("query", query2);
        } else {
          connection2.writeError({
            code: Errors.HA_ERR_INTERNAL_ERROR,
            message: "No query handler"
          });
        }
        break;
      case CommandCode$2.FIELD_LIST:
        if (connection2.listeners("field_list").length) {
          const table = packet2.readNullTerminatedString(encoding);
          const fields2 = packet2.readString(void 0, encoding);
          connection2.emit("field_list", table, fields2);
        } else {
          connection2.writeError({
            code: Errors.ER_WARN_DEPRECATED_SYNTAX,
            message: "As of MySQL 5.7.11, COM_FIELD_LIST is deprecated and will be removed in a future version of MySQL."
          });
        }
        break;
      case CommandCode$2.PING:
        if (connection2.listeners("ping").length) {
          connection2.emit("ping");
        } else {
          connection2.writeOk();
        }
        break;
      default:
        knownCommand = false;
    }
    if (connection2.listeners("packet").length) {
      connection2.emit("packet", packet2.clone(), knownCommand, commandCode);
    } else if (!knownCommand) {
      console.log("Unknown command:", commandCode);
    }
    return ServerHandshake.prototype.dispatchCommands;
  }
};
var server_handshake = ServerHandshake$1;
var helpers$4 = {};
function srcEscape(str) {
  return JSON.stringify({
    [str]: 1
  }).slice(1, -3);
}
helpers$4.srcEscape = srcEscape;
let highlightFn;
let cardinalRecommended = false;
try {
  const REQUIRE_TERMINATOR = "";
  highlightFn = commonjsRequire(`cardinal${REQUIRE_TERMINATOR}`).highlight;
} catch (err) {
  highlightFn = (text) => {
    if (!cardinalRecommended) {
      console.log("For nicer debug output consider install cardinal@^2.0.0");
      cardinalRecommended = true;
    }
    return text;
  };
}
function printDebugWithCode(msg, code) {
  console.log(`

${msg}:
`);
  console.log(`${highlightFn(code)}
`);
}
helpers$4.printDebugWithCode = printDebugWithCode;
function typeMatch(type, list, Types2) {
  if (Array.isArray(list)) {
    return list.some((t) => type === Types2[t]);
  }
  return !!list;
}
helpers$4.typeMatch = typeMatch;
const privateObjectProps = /* @__PURE__ */ new Set([
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
  "__proto__"
]);
helpers$4.privateObjectProps = privateObjectProps;
const fieldEscape = (field, isEval = true) => {
  if (privateObjectProps.has(field)) {
    throw new Error(
      `The field name (${field}) can't be the same as an object's private property.`
    );
  }
  return isEval ? srcEscape(field) : field;
};
helpers$4.fieldEscape = fieldEscape;
function isProperty$1(str) {
  return /^[$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f]*$/.test(str);
}
var isProperty_1 = isProperty$1;
var util = require$$0$5;
var isProperty = isProperty_1;
var INDENT_START = /[\{\[]/;
var INDENT_END = /[\}\]]/;
var RESERVED = [
  "do",
  "if",
  "in",
  "for",
  "let",
  "new",
  "try",
  "var",
  "case",
  "else",
  "enum",
  "eval",
  "null",
  "this",
  "true",
  "void",
  "with",
  "await",
  "break",
  "catch",
  "class",
  "const",
  "false",
  "super",
  "throw",
  "while",
  "yield",
  "delete",
  "export",
  "import",
  "public",
  "return",
  "static",
  "switch",
  "typeof",
  "default",
  "extends",
  "finally",
  "package",
  "private",
  "continue",
  "debugger",
  "function",
  "arguments",
  "interface",
  "protected",
  "implements",
  "instanceof",
  "NaN",
  "undefined"
];
var RESERVED_MAP = {};
for (var i = 0; i < RESERVED.length; i++) {
  RESERVED_MAP[RESERVED[i]] = true;
}
var isVariable = function(name) {
  return isProperty(name) && !RESERVED_MAP.hasOwnProperty(name);
};
var formats = {
  s: function(s) {
    return "" + s;
  },
  d: function(d) {
    return "" + Number(d);
  },
  o: function(o) {
    return JSON.stringify(o);
  }
};
var genfun = function() {
  var lines = [];
  var indent = 0;
  var vars = {};
  var push2 = function(str) {
    var spaces = "";
    while (spaces.length < indent * 2) spaces += "  ";
    lines.push(spaces + str);
  };
  var pushLine = function(line2) {
    if (INDENT_END.test(line2.trim()[0]) && INDENT_START.test(line2[line2.length - 1])) {
      indent--;
      push2(line2);
      indent++;
      return;
    }
    if (INDENT_START.test(line2[line2.length - 1])) {
      push2(line2);
      indent++;
      return;
    }
    if (INDENT_END.test(line2.trim()[0])) {
      indent--;
      push2(line2);
      return;
    }
    push2(line2);
  };
  var line = function(fmt) {
    if (!fmt) return line;
    if (arguments.length === 1 && fmt.indexOf("\n") > -1) {
      var lines2 = fmt.trim().split("\n");
      for (var i = 0; i < lines2.length; i++) {
        pushLine(lines2[i].trim());
      }
    } else {
      pushLine(util.format.apply(util, arguments));
    }
    return line;
  };
  line.scope = {};
  line.formats = formats;
  line.sym = function(name) {
    if (!name || !isVariable(name)) name = "tmp";
    if (!vars[name]) vars[name] = 0;
    return name + (vars[name]++ || "");
  };
  line.property = function(obj, name) {
    if (arguments.length === 1) {
      name = obj;
      obj = "";
    }
    name = name + "";
    if (isProperty(name)) return obj ? obj + "." + name : name;
    return obj ? obj + "[" + JSON.stringify(name) + "]" : JSON.stringify(name);
  };
  line.toString = function() {
    return lines.join("\n");
  };
  line.toFunction = function(scope) {
    if (!scope) scope = {};
    var src = "return (" + line.toString() + ")";
    Object.keys(line.scope).forEach(function(key) {
      if (!scope[key]) scope[key] = line.scope[key];
    });
    var keys = Object.keys(scope).map(function(key) {
      return key;
    });
    var vals = keys.map(function(key) {
      return scope[key];
    });
    return Function.apply(null, keys.concat(src)).apply(null, vals);
  };
  if (arguments.length) line.apply(null, arguments);
  return line;
};
genfun.formats = formats;
var generateFunction = genfun;
const Types$3 = requireTypes();
const Charsets$3 = charsets;
const helpers$3 = helpers$4;
const genFunc$1 = generateFunction;
const parserCache$1 = parser_cache;
const typeNames$3 = [];
for (const t in Types$3) {
  typeNames$3[Types$3[t]] = t;
}
function readCodeFor$1(type, charset, encodingExpr, config, options) {
  const supportBigNumbers = Boolean(
    options.supportBigNumbers || config.supportBigNumbers
  );
  const bigNumberStrings = Boolean(
    options.bigNumberStrings || config.bigNumberStrings
  );
  const timezone = options.timezone || config.timezone;
  const dateStrings = options.dateStrings || config.dateStrings;
  switch (type) {
    case Types$3.TINY:
    case Types$3.SHORT:
    case Types$3.LONG:
    case Types$3.INT24:
    case Types$3.YEAR:
      return "packet.parseLengthCodedIntNoBigCheck()";
    case Types$3.LONGLONG:
      if (supportBigNumbers && bigNumberStrings) {
        return "packet.parseLengthCodedIntString()";
      }
      return `packet.parseLengthCodedInt(${supportBigNumbers})`;
    case Types$3.FLOAT:
    case Types$3.DOUBLE:
      return "packet.parseLengthCodedFloat()";
    case Types$3.NULL:
      return "packet.readLengthCodedNumber()";
    case Types$3.DECIMAL:
    case Types$3.NEWDECIMAL:
      if (config.decimalNumbers) {
        return "packet.parseLengthCodedFloat()";
      }
      return 'packet.readLengthCodedString("ascii")';
    case Types$3.DATE:
      if (helpers$3.typeMatch(type, dateStrings, Types$3)) {
        return 'packet.readLengthCodedString("ascii")';
      }
      return `packet.parseDate(${helpers$3.srcEscape(timezone)})`;
    case Types$3.DATETIME:
    case Types$3.TIMESTAMP:
      if (helpers$3.typeMatch(type, dateStrings, Types$3)) {
        return 'packet.readLengthCodedString("ascii")';
      }
      return `packet.parseDateTime(${helpers$3.srcEscape(timezone)})`;
    case Types$3.TIME:
      return 'packet.readLengthCodedString("ascii")';
    case Types$3.GEOMETRY:
      return "packet.parseGeometryValue()";
    case Types$3.VECTOR:
      return "packet.parseVector()";
    case Types$3.JSON:
      return config.jsonStrings ? 'packet.readLengthCodedString("utf8")' : 'JSON.parse(packet.readLengthCodedString("utf8"))';
    default:
      if (charset === Charsets$3.BINARY) {
        return "packet.readLengthCodedBuffer()";
      }
      return `packet.readLengthCodedString(${encodingExpr})`;
  }
}
function compile$1(fields2, options, config) {
  if (typeof config.typeCast === "function" && typeof options.typeCast !== "function") {
    options.typeCast = config.typeCast;
  }
  function wrap(field, _this) {
    return {
      type: typeNames$3[field.columnType],
      length: field.columnLength,
      db: field.schema,
      table: field.table,
      name: field.name,
      string: function(encoding = field.encoding) {
        if (field.columnType === Types$3.JSON && encoding === field.encoding) {
          console.warn(
            `typeCast: JSON column "${field.name}" is interpreted as BINARY by default, recommended to manually set utf8 encoding: \`field.string("utf8")\``
          );
        }
        return _this.packet.readLengthCodedString(encoding);
      },
      buffer: function() {
        return _this.packet.readLengthCodedBuffer();
      },
      geometry: function() {
        return _this.packet.parseGeometryValue();
      }
    };
  }
  const parserFn = genFunc$1();
  parserFn("(function () {")("return class TextRow {");
  parserFn("constructor(fields) {");
  if (typeof options.typeCast === "function") {
    parserFn("const _this = this;");
    parserFn("for(let i=0; i<fields.length; ++i) {");
    parserFn("this[`wrap${i}`] = wrap(fields[i], _this);");
    parserFn("}");
  }
  parserFn("}");
  parserFn("next(packet, fields, options) {");
  parserFn("this.packet = packet;");
  if (options.rowsAsArray) {
    parserFn(`const result = new Array(${fields2.length});`);
  } else {
    parserFn("const result = {};");
  }
  const resultTables = {};
  let resultTablesArray = [];
  if (options.nestTables === true) {
    for (let i = 0; i < fields2.length; i++) {
      resultTables[fields2[i].table] = 1;
    }
    resultTablesArray = Object.keys(resultTables);
    for (let i = 0; i < resultTablesArray.length; i++) {
      parserFn(`result[${helpers$3.fieldEscape(resultTablesArray[i])}] = {};`);
    }
  }
  let lvalue = "";
  let fieldName = "";
  let tableName = "";
  for (let i = 0; i < fields2.length; i++) {
    fieldName = helpers$3.fieldEscape(fields2[i].name);
    if (typeof options.nestTables === "string") {
      lvalue = `result[${helpers$3.fieldEscape(fields2[i].table + options.nestTables + fields2[i].name)}]`;
    } else if (options.nestTables === true) {
      tableName = helpers$3.fieldEscape(fields2[i].table);
      parserFn(`if (!result[${tableName}]) result[${tableName}] = {};`);
      lvalue = `result[${tableName}][${fieldName}]`;
    } else if (options.rowsAsArray) {
      lvalue = `result[${i.toString(10)}]`;
    } else {
      lvalue = `result[${fieldName}]`;
    }
    if (options.typeCast === false) {
      parserFn(`${lvalue} = packet.readLengthCodedBuffer();`);
    } else {
      const encodingExpr = `fields[${i}].encoding`;
      const readCode = readCodeFor$1(
        fields2[i].columnType,
        fields2[i].characterSet,
        encodingExpr,
        config,
        options
      );
      if (typeof options.typeCast === "function") {
        parserFn(
          `${lvalue} = options.typeCast(this.wrap${i}, function() { return ${readCode} });`
        );
      } else {
        parserFn(`${lvalue} = ${readCode};`);
      }
    }
  }
  parserFn("return result;");
  parserFn("}");
  parserFn("};")("})()");
  if (config.debug) {
    helpers$3.printDebugWithCode(
      "Compiled text protocol row parser",
      parserFn.toString()
    );
  }
  if (typeof options.typeCast === "function") {
    return parserFn.toFunction({ wrap });
  }
  return parserFn.toFunction();
}
function getTextParser$2(fields2, options, config) {
  return parserCache$1.getParser("text", fields2, options, config, compile$1);
}
var text_parser = getTextParser$2;
const Types$2 = requireTypes();
const Charsets$2 = charsets;
const helpers$2 = helpers$4;
const typeNames$2 = [];
for (const t in Types$2) {
  typeNames$2[Types$2[t]] = t;
}
function readField({ packet: packet2, type, charset, encoding, config, options }) {
  const supportBigNumbers = Boolean(
    options.supportBigNumbers || config.supportBigNumbers
  );
  const bigNumberStrings = Boolean(
    options.bigNumberStrings || config.bigNumberStrings
  );
  const timezone = options.timezone || config.timezone;
  const dateStrings = options.dateStrings || config.dateStrings;
  switch (type) {
    case Types$2.TINY:
    case Types$2.SHORT:
    case Types$2.LONG:
    case Types$2.INT24:
    case Types$2.YEAR:
      return packet2.parseLengthCodedIntNoBigCheck();
    case Types$2.LONGLONG:
      if (supportBigNumbers && bigNumberStrings) {
        return packet2.parseLengthCodedIntString();
      }
      return packet2.parseLengthCodedInt(supportBigNumbers);
    case Types$2.FLOAT:
    case Types$2.DOUBLE:
      return packet2.parseLengthCodedFloat();
    case Types$2.NULL:
    case Types$2.DECIMAL:
    case Types$2.NEWDECIMAL:
      if (config.decimalNumbers) {
        return packet2.parseLengthCodedFloat();
      }
      return packet2.readLengthCodedString("ascii");
    case Types$2.DATE:
      if (helpers$2.typeMatch(type, dateStrings, Types$2)) {
        return packet2.readLengthCodedString("ascii");
      }
      return packet2.parseDate(timezone);
    case Types$2.DATETIME:
    case Types$2.TIMESTAMP:
      if (helpers$2.typeMatch(type, dateStrings, Types$2)) {
        return packet2.readLengthCodedString("ascii");
      }
      return packet2.parseDateTime(timezone);
    case Types$2.TIME:
      return packet2.readLengthCodedString("ascii");
    case Types$2.GEOMETRY:
      return packet2.parseGeometryValue();
    case Types$2.VECTOR:
      return packet2.parseVector();
    case Types$2.JSON:
      return config.jsonStrings ? packet2.readLengthCodedString("utf8") : JSON.parse(packet2.readLengthCodedString("utf8"));
    default:
      if (charset === Charsets$2.BINARY) {
        return packet2.readLengthCodedBuffer();
      }
      return packet2.readLengthCodedString(encoding);
  }
}
function createTypecastField(field, packet2) {
  return {
    type: typeNames$2[field.columnType],
    length: field.columnLength,
    db: field.schema,
    table: field.table,
    name: field.name,
    string: function(encoding = field.encoding) {
      if (field.columnType === Types$2.JSON && encoding === field.encoding) {
        console.warn(
          `typeCast: JSON column "${field.name}" is interpreted as BINARY by default, recommended to manually set utf8 encoding: \`field.string("utf8")\``
        );
      }
      return packet2.readLengthCodedString(encoding);
    },
    buffer: function() {
      return packet2.readLengthCodedBuffer();
    },
    geometry: function() {
      return packet2.parseGeometryValue();
    }
  };
}
function getTextParser$1(_fields, _options, config) {
  return {
    next(packet2, fields2, options) {
      const result = options.rowsAsArray ? [] : {};
      for (let i = 0; i < fields2.length; i++) {
        const field = fields2[i];
        const typeCast = options.typeCast ? options.typeCast : config.typeCast;
        const next = () => readField({
          packet: packet2,
          type: field.columnType,
          encoding: field.encoding,
          charset: field.characterSet,
          config,
          options
        });
        let value;
        if (options.typeCast === false) {
          value = packet2.readLengthCodedBuffer();
        } else if (typeof typeCast === "function") {
          value = typeCast(createTypecastField(field, packet2), next);
        } else {
          value = next();
        }
        if (options.rowsAsArray) {
          result.push(value);
        } else if (typeof options.nestTables === "string") {
          result[`${helpers$2.fieldEscape(field.table, false)}${options.nestTables}${helpers$2.fieldEscape(field.name, false)}`] = value;
        } else if (options.nestTables) {
          const tableName = helpers$2.fieldEscape(field.table, false);
          if (!result[tableName]) {
            result[tableName] = {};
          }
          result[tableName][helpers$2.fieldEscape(field.name, false)] = value;
        } else {
          result[helpers$2.fieldEscape(field.name, false)] = value;
        }
      }
      return result;
    }
  };
}
var static_text_parser = getTextParser$1;
const process$3 = require$$0$3;
const Timers$1 = require$$1;
const Readable$1 = require$$0$6.Readable;
const Command$8 = command;
const Packets$7 = packetsExports;
const getTextParser = text_parser;
const staticParser = static_text_parser;
const ServerStatus = server_status;
const EmptyPacket = new Packets$7.Packet(0, Buffer.allocUnsafe(4), 0, 4);
let Query$2 = class Query2 extends Command$8 {
  constructor(options, callback) {
    super();
    this.sql = options.sql;
    this.values = options.values;
    this._queryOptions = options;
    this.namedPlaceholders = options.namedPlaceholders || false;
    this.onResult = callback;
    this.timeout = options.timeout;
    this.queryTimeout = null;
    this._fieldCount = 0;
    this._rowParser = null;
    this._fields = [];
    this._rows = [];
    this._receivedFieldsCount = 0;
    this._resultIndex = 0;
    this._localStream = null;
    this._unpipeStream = function() {
    };
    this._streamFactory = options.infileStreamFactory;
    this._connection = null;
  }
  then() {
    const err = "You have tried to call .then(), .catch(), or invoked await on the result of query that is not a promise, which is a programming error. Try calling con.promise().query(), or require('mysql2/promise') instead of 'mysql2' for a promise-compatible version of the query interface. To learn how to use async/await or Promises check out documentation at https://sidorares.github.io/node-mysql2/docs#using-promise-wrapper, or the mysql2 documentation at https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper";
    console.log(err);
    throw new Error(err);
  }
  /* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */
  start(_packet, connection2) {
    if (connection2.config.debug) {
      console.log("        Sending query command: %s", this.sql);
    }
    this._connection = connection2;
    this.options = Object.assign({}, connection2.config, this._queryOptions);
    this._setTimeout();
    const cmdPacket = new Packets$7.Query(
      this.sql,
      connection2.config.charsetNumber
    );
    connection2.writePacket(cmdPacket.toPacket(1));
    return Query2.prototype.resultsetHeader;
  }
  done() {
    this._unpipeStream();
    if (this.timeout && !this.queryTimeout) {
      return null;
    }
    if (this.queryTimeout) {
      Timers$1.clearTimeout(this.queryTimeout);
      this.queryTimeout = null;
    }
    if (this.onResult) {
      let rows, fields2;
      if (this._resultIndex === 0) {
        rows = this._rows[0];
        fields2 = this._fields[0];
      } else {
        rows = this._rows;
        fields2 = this._fields;
      }
      if (fields2) {
        process$3.nextTick(() => {
          this.onResult(null, rows, fields2);
        });
      } else {
        process$3.nextTick(() => {
          this.onResult(null, rows);
        });
      }
    }
    return null;
  }
  doneInsert(rs) {
    if (this._localStreamError) {
      if (this.onResult) {
        this.onResult(this._localStreamError, rs);
      } else {
        this.emit("error", this._localStreamError);
      }
      return null;
    }
    this._rows.push(rs);
    this._fields.push(void 0);
    this.emit("fields", void 0);
    this.emit("result", rs);
    if (rs.serverStatus & ServerStatus.SERVER_MORE_RESULTS_EXISTS) {
      this._resultIndex++;
      return this.resultsetHeader;
    }
    return this.done();
  }
  resultsetHeader(packet2, connection2) {
    const rs = new Packets$7.ResultSetHeader(packet2, connection2);
    this._fieldCount = rs.fieldCount;
    if (connection2.config.debug) {
      console.log(
        `        Resultset header received, expecting ${rs.fieldCount} column definition packets`
      );
    }
    if (this._fieldCount === 0) {
      return this.doneInsert(rs);
    }
    if (this._fieldCount === null) {
      return this._streamLocalInfile(connection2, rs.infileName);
    }
    this._receivedFieldsCount = 0;
    this._rows.push([]);
    this._fields.push([]);
    return this.readField;
  }
  _streamLocalInfile(connection2, path) {
    if (this._streamFactory) {
      this._localStream = this._streamFactory(path);
    } else {
      this._localStreamError = new Error(
        `As a result of LOCAL INFILE command server wants to read ${path} file, but as of v2.0 you must provide streamFactory option returning ReadStream.`
      );
      connection2.writePacket(EmptyPacket);
      return this.infileOk;
    }
    const onConnectionError = () => {
      this._unpipeStream();
    };
    const onDrain = () => {
      this._localStream.resume();
    };
    const onPause = () => {
      this._localStream.pause();
    };
    const onData = function(data) {
      const dataWithHeader = Buffer.allocUnsafe(data.length + 4);
      data.copy(dataWithHeader, 4);
      connection2.writePacket(
        new Packets$7.Packet(0, dataWithHeader, 0, dataWithHeader.length)
      );
    };
    const onEnd = () => {
      connection2.removeListener("error", onConnectionError);
      connection2.writePacket(EmptyPacket);
    };
    const onError = (err) => {
      this._localStreamError = err;
      connection2.removeListener("error", onConnectionError);
      connection2.writePacket(EmptyPacket);
    };
    this._unpipeStream = () => {
      connection2.stream.removeListener("pause", onPause);
      connection2.stream.removeListener("drain", onDrain);
      this._localStream.removeListener("data", onData);
      this._localStream.removeListener("end", onEnd);
      this._localStream.removeListener("error", onError);
    };
    connection2.stream.on("pause", onPause);
    connection2.stream.on("drain", onDrain);
    this._localStream.on("data", onData);
    this._localStream.on("end", onEnd);
    this._localStream.on("error", onError);
    connection2.once("error", onConnectionError);
    return this.infileOk;
  }
  readField(packet2, connection2) {
    this._receivedFieldsCount++;
    if (this._fields[this._resultIndex].length !== this._fieldCount) {
      const field = new Packets$7.ColumnDefinition(
        packet2,
        connection2.clientEncoding
      );
      this._fields[this._resultIndex].push(field);
      if (connection2.config.debug) {
        console.log("        Column definition:");
        console.log(`          name: ${field.name}`);
        console.log(`          type: ${field.columnType}`);
        console.log(`         flags: ${field.flags}`);
      }
    }
    if (this._receivedFieldsCount === this._fieldCount) {
      const fields2 = this._fields[this._resultIndex];
      this.emit("fields", fields2);
      if (this.options.disableEval) {
        this._rowParser = staticParser(fields2, this.options, connection2.config);
      } else {
        this._rowParser = new (getTextParser(
          fields2,
          this.options,
          connection2.config
        ))(fields2);
      }
      return Query2.prototype.fieldsEOF;
    }
    return Query2.prototype.readField;
  }
  fieldsEOF(packet2, connection2) {
    if (!packet2.isEOF()) {
      return connection2.protocolError("Expected EOF packet");
    }
    return this.row;
  }
  /* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */
  row(packet2, _connection) {
    if (packet2.isEOF()) {
      const status = packet2.eofStatusFlags();
      const moreResults = status & ServerStatus.SERVER_MORE_RESULTS_EXISTS;
      if (moreResults) {
        this._resultIndex++;
        return Query2.prototype.resultsetHeader;
      }
      return this.done();
    }
    let row;
    try {
      row = this._rowParser.next(
        packet2,
        this._fields[this._resultIndex],
        this.options
      );
    } catch (err) {
      this._localStreamError = err;
      return this.doneInsert(null);
    }
    if (this.onResult) {
      this._rows[this._resultIndex].push(row);
    } else {
      this.emit("result", row, this._resultIndex);
    }
    return Query2.prototype.row;
  }
  infileOk(packet2, connection2) {
    const rs = new Packets$7.ResultSetHeader(packet2, connection2);
    return this.doneInsert(rs);
  }
  stream(options) {
    options = options || {};
    options.objectMode = true;
    const stream = new Readable$1(options);
    stream._read = () => {
      this._connection && this._connection.resume();
    };
    this.on("result", (row, resultSetIndex) => {
      if (!stream.push(row)) {
        this._connection.pause();
      }
      stream.emit("result", row, resultSetIndex);
    });
    this.on("error", (err) => {
      stream.emit("error", err);
    });
    this.on("end", () => {
      stream.push(null);
    });
    this.on("fields", (fields2) => {
      stream.emit("fields", fields2);
    });
    stream.on("end", () => {
      stream.emit("close");
    });
    return stream;
  }
  _setTimeout() {
    if (this.timeout) {
      const timeoutHandler = this._handleTimeoutError.bind(this);
      this.queryTimeout = Timers$1.setTimeout(timeoutHandler, this.timeout);
    }
  }
  _handleTimeoutError() {
    if (this.queryTimeout) {
      Timers$1.clearTimeout(this.queryTimeout);
      this.queryTimeout = null;
    }
    const err = new Error("Query inactivity timeout");
    err.errorno = "PROTOCOL_SEQUENCE_TIMEOUT";
    err.code = "PROTOCOL_SEQUENCE_TIMEOUT";
    err.syscall = "query";
    if (this.onResult) {
      this.onResult(err);
    } else {
      this.emit("error", err);
    }
  }
};
Query$2.prototype.catch = Query$2.prototype.then;
var query = Query$2;
const Command$7 = command;
const Packets$6 = packetsExports;
let CloseStatement$1 = class CloseStatement2 extends Command$7 {
  constructor(id) {
    super();
    this.id = id;
  }
  start(packet2, connection2) {
    connection2.writePacket(new Packets$6.CloseStatement(this.id).toPacket(1));
    return null;
  }
};
var close_statement = CloseStatement$1;
const FieldFlags$1 = field_flags;
const Charsets$1 = charsets;
const Types$1 = requireTypes();
const helpers$1 = helpers$4;
const genFunc = generateFunction;
const parserCache = parser_cache;
const typeNames$1 = [];
for (const t in Types$1) {
  typeNames$1[Types$1[t]] = t;
}
function readCodeFor(field, config, options, fieldNum) {
  const supportBigNumbers = Boolean(
    options.supportBigNumbers || config.supportBigNumbers
  );
  const bigNumberStrings = Boolean(
    options.bigNumberStrings || config.bigNumberStrings
  );
  const timezone = options.timezone || config.timezone;
  const dateStrings = options.dateStrings || config.dateStrings;
  const unsigned = field.flags & FieldFlags$1.UNSIGNED;
  switch (field.columnType) {
    case Types$1.TINY:
      return unsigned ? "packet.readInt8();" : "packet.readSInt8();";
    case Types$1.SHORT:
      return unsigned ? "packet.readInt16();" : "packet.readSInt16();";
    case Types$1.LONG:
    case Types$1.INT24:
      return unsigned ? "packet.readInt32();" : "packet.readSInt32();";
    case Types$1.YEAR:
      return "packet.readInt16()";
    case Types$1.FLOAT:
      return "packet.readFloat();";
    case Types$1.DOUBLE:
      return "packet.readDouble();";
    case Types$1.NULL:
      return "null;";
    case Types$1.DATE:
    case Types$1.DATETIME:
    case Types$1.TIMESTAMP:
    case Types$1.NEWDATE:
      if (helpers$1.typeMatch(field.columnType, dateStrings, Types$1)) {
        return `packet.readDateTimeString(${parseInt(field.decimals, 10)}, ${null}, ${field.columnType});`;
      }
      return `packet.readDateTime(${helpers$1.srcEscape(timezone)});`;
    case Types$1.TIME:
      return "packet.readTimeString()";
    case Types$1.DECIMAL:
    case Types$1.NEWDECIMAL:
      if (config.decimalNumbers) {
        return "packet.parseLengthCodedFloat();";
      }
      return 'packet.readLengthCodedString("ascii");';
    case Types$1.GEOMETRY:
      return "packet.parseGeometryValue();";
    case Types$1.VECTOR:
      return "packet.parseVector()";
    case Types$1.JSON:
      return config.jsonStrings ? 'packet.readLengthCodedString("utf8")' : 'JSON.parse(packet.readLengthCodedString("utf8"));';
    case Types$1.LONGLONG:
      if (!supportBigNumbers) {
        return unsigned ? "packet.readInt64JSNumber();" : "packet.readSInt64JSNumber();";
      }
      if (bigNumberStrings) {
        return unsigned ? "packet.readInt64String();" : "packet.readSInt64String();";
      }
      return unsigned ? "packet.readInt64();" : "packet.readSInt64();";
    default:
      if (field.characterSet === Charsets$1.BINARY) {
        return "packet.readLengthCodedBuffer();";
      }
      return `packet.readLengthCodedString(fields[${fieldNum}].encoding)`;
  }
}
function compile(fields2, options, config) {
  const parserFn = genFunc();
  const nullBitmapLength = Math.floor((fields2.length + 7 + 2) / 8);
  function wrap(field, packet2) {
    return {
      type: typeNames$1[field.columnType],
      length: field.columnLength,
      db: field.schema,
      table: field.table,
      name: field.name,
      string: function(encoding = field.encoding) {
        if (field.columnType === Types$1.JSON && encoding === field.encoding) {
          console.warn(
            `typeCast: JSON column "${field.name}" is interpreted as BINARY by default, recommended to manually set utf8 encoding: \`field.string("utf8")\``
          );
        }
        if ([Types$1.DATETIME, Types$1.NEWDATE, Types$1.TIMESTAMP, Types$1.DATE].includes(
          field.columnType
        )) {
          return packet2.readDateTimeString(parseInt(field.decimals, 10));
        }
        if (field.columnType === Types$1.TINY) {
          const unsigned = field.flags & FieldFlags$1.UNSIGNED;
          return String(unsigned ? packet2.readInt8() : packet2.readSInt8());
        }
        if (field.columnType === Types$1.TIME) {
          return packet2.readTimeString();
        }
        return packet2.readLengthCodedString(encoding);
      },
      buffer: function() {
        return packet2.readLengthCodedBuffer();
      },
      geometry: function() {
        return packet2.parseGeometryValue();
      }
    };
  }
  parserFn("(function(){");
  parserFn("return class BinaryRow {");
  parserFn("constructor() {");
  parserFn("}");
  parserFn("next(packet, fields, options) {");
  if (options.rowsAsArray) {
    parserFn(`const result = new Array(${fields2.length});`);
  } else {
    parserFn("const result = {};");
  }
  if (typeof config.typeCast === "function" && typeof options.typeCast !== "function") {
    options.typeCast = config.typeCast;
  }
  parserFn("packet.readInt8();");
  for (let i = 0; i < nullBitmapLength; ++i) {
    parserFn(`const nullBitmaskByte${i} = packet.readInt8();`);
  }
  let lvalue = "";
  let currentFieldNullBit = 4;
  let nullByteIndex = 0;
  let fieldName = "";
  let tableName = "";
  for (let i = 0; i < fields2.length; i++) {
    fieldName = helpers$1.fieldEscape(fields2[i].name);
    if (typeof options.nestTables === "string") {
      lvalue = `result[${helpers$1.fieldEscape(fields2[i].table + options.nestTables + fields2[i].name)}]`;
    } else if (options.nestTables === true) {
      tableName = helpers$1.fieldEscape(fields2[i].table);
      parserFn(`if (!result[${tableName}]) result[${tableName}] = {};`);
      lvalue = `result[${tableName}][${fieldName}]`;
    } else if (options.rowsAsArray) {
      lvalue = `result[${i.toString(10)}]`;
    } else {
      lvalue = `result[${fieldName}]`;
    }
    parserFn(`if (nullBitmaskByte${nullByteIndex} & ${currentFieldNullBit}) `);
    parserFn(`${lvalue} = null;`);
    parserFn("else {");
    if (options.typeCast === false) {
      parserFn(`${lvalue} = packet.readLengthCodedBuffer();`);
    } else {
      const fieldWrapperVar = `fieldWrapper${i}`;
      parserFn(`const ${fieldWrapperVar} = wrap(fields[${i}], packet);`);
      const readCode = readCodeFor(fields2[i], config, options, i);
      if (typeof options.typeCast === "function") {
        parserFn(
          `${lvalue} = options.typeCast(${fieldWrapperVar}, function() { return ${readCode} });`
        );
      } else {
        parserFn(`${lvalue} = ${readCode};`);
      }
    }
    parserFn("}");
    currentFieldNullBit *= 2;
    if (currentFieldNullBit === 256) {
      currentFieldNullBit = 1;
      nullByteIndex++;
    }
  }
  parserFn("return result;");
  parserFn("}");
  parserFn("};")("})()");
  if (config.debug) {
    helpers$1.printDebugWithCode(
      "Compiled binary protocol row parser",
      parserFn.toString()
    );
  }
  return parserFn.toFunction({ wrap });
}
function getBinaryParser$2(fields2, options, config) {
  return parserCache.getParser("binary", fields2, options, config, compile);
}
var binary_parser = getBinaryParser$2;
const FieldFlags = field_flags;
const Charsets = charsets;
const Types = requireTypes();
const helpers = helpers$4;
const typeNames = [];
for (const t in Types) {
  typeNames[Types[t]] = t;
}
function getBinaryParser$1(fields2, _options, config) {
  function readCode(field, config2, options, fieldNum, packet2) {
    const supportBigNumbers = Boolean(
      options.supportBigNumbers || config2.supportBigNumbers
    );
    const bigNumberStrings = Boolean(
      options.bigNumberStrings || config2.bigNumberStrings
    );
    const timezone = options.timezone || config2.timezone;
    const dateStrings = options.dateStrings || config2.dateStrings;
    const unsigned = field.flags & FieldFlags.UNSIGNED;
    switch (field.columnType) {
      case Types.TINY:
        return unsigned ? packet2.readInt8() : packet2.readSInt8();
      case Types.SHORT:
        return unsigned ? packet2.readInt16() : packet2.readSInt16();
      case Types.LONG:
      case Types.INT24:
        return unsigned ? packet2.readInt32() : packet2.readSInt32();
      case Types.YEAR:
        return packet2.readInt16();
      case Types.FLOAT:
        return packet2.readFloat();
      case Types.DOUBLE:
        return packet2.readDouble();
      case Types.NULL:
        return null;
      case Types.DATE:
      case Types.DATETIME:
      case Types.TIMESTAMP:
      case Types.NEWDATE:
        return helpers.typeMatch(field.columnType, dateStrings, Types) ? packet2.readDateTimeString(
          parseInt(field.decimals, 10),
          null,
          field.columnType
        ) : packet2.readDateTime(timezone);
      case Types.TIME:
        return packet2.readTimeString();
      case Types.DECIMAL:
      case Types.NEWDECIMAL:
        return config2.decimalNumbers ? packet2.parseLengthCodedFloat() : packet2.readLengthCodedString("ascii");
      case Types.GEOMETRY:
        return packet2.parseGeometryValue();
      case Types.VECTOR:
        return packet2.parseVector();
      case Types.JSON:
        return config2.jsonStrings ? packet2.readLengthCodedString("utf8") : JSON.parse(packet2.readLengthCodedString("utf8"));
      case Types.LONGLONG:
        if (!supportBigNumbers)
          return unsigned ? packet2.readInt64JSNumber() : packet2.readSInt64JSNumber();
        return bigNumberStrings ? unsigned ? packet2.readInt64String() : packet2.readSInt64String() : unsigned ? packet2.readInt64() : packet2.readSInt64();
      default:
        return field.characterSet === Charsets.BINARY ? packet2.readLengthCodedBuffer() : packet2.readLengthCodedString(fields2[fieldNum].encoding);
    }
  }
  return class BinaryRow {
    constructor() {
    }
    next(packet2, fields3, options) {
      packet2.readInt8();
      const nullBitmapLength = Math.floor((fields3.length + 7 + 2) / 8);
      const nullBitmaskBytes = new Array(nullBitmapLength);
      for (let i = 0; i < nullBitmapLength; i++) {
        nullBitmaskBytes[i] = packet2.readInt8();
      }
      const result = options.rowsAsArray ? new Array(fields3.length) : {};
      let currentFieldNullBit = 4;
      let nullByteIndex = 0;
      for (let i = 0; i < fields3.length; i++) {
        const field = fields3[i];
        const typeCast = options.typeCast !== void 0 ? options.typeCast : config.typeCast;
        let value;
        if (nullBitmaskBytes[nullByteIndex] & currentFieldNullBit) {
          value = null;
        } else if (options.typeCast === false) {
          value = packet2.readLengthCodedBuffer();
        } else {
          const next = () => readCode(field, config, options, i, packet2);
          value = typeof typeCast === "function" ? typeCast(
            {
              type: typeNames[field.columnType],
              length: field.columnLength,
              db: field.schema,
              table: field.table,
              name: field.name,
              string: function(encoding = field.encoding) {
                if (field.columnType === Types.JSON && encoding === field.encoding) {
                  console.warn(
                    `typeCast: JSON column "${field.name}" is interpreted as BINARY by default, recommended to manually set utf8 encoding: \`field.string("utf8")\``
                  );
                }
                if ([
                  Types.DATETIME,
                  Types.NEWDATE,
                  Types.TIMESTAMP,
                  Types.DATE
                ].includes(field.columnType)) {
                  return packet2.readDateTimeString(
                    parseInt(field.decimals, 10)
                  );
                }
                if (field.columnType === Types.TINY) {
                  const unsigned = field.flags & FieldFlags.UNSIGNED;
                  return String(
                    unsigned ? packet2.readInt8() : packet2.readSInt8()
                  );
                }
                if (field.columnType === Types.TIME) {
                  return packet2.readTimeString();
                }
                return packet2.readLengthCodedString(encoding);
              },
              buffer: function() {
                return packet2.readLengthCodedBuffer();
              },
              geometry: function() {
                return packet2.parseGeometryValue();
              }
            },
            next
          ) : next();
        }
        if (options.rowsAsArray) {
          result[i] = value;
        } else if (typeof options.nestTables === "string") {
          const key = helpers.fieldEscape(
            field.table + options.nestTables + field.name,
            false
          );
          result[key] = value;
        } else if (options.nestTables === true) {
          const tableName = helpers.fieldEscape(field.table, false);
          if (!result[tableName]) {
            result[tableName] = {};
          }
          const fieldName = helpers.fieldEscape(field.name, false);
          result[tableName][fieldName] = value;
        } else {
          const key = helpers.fieldEscape(field.name, false);
          result[key] = value;
        }
        currentFieldNullBit *= 2;
        if (currentFieldNullBit === 256) {
          currentFieldNullBit = 1;
          nullByteIndex++;
        }
      }
      return result;
    }
  };
}
var static_binary_parser = getBinaryParser$1;
const Command$6 = command;
const Query$1 = query;
const Packets$5 = packetsExports;
const getBinaryParser = binary_parser;
const getStaticBinaryParser = static_binary_parser;
let Execute$2 = class Execute2 extends Command$6 {
  constructor(options, callback) {
    super();
    this.statement = options.statement;
    this.sql = options.sql;
    this.values = options.values;
    this.onResult = callback;
    this.parameters = options.values;
    this.insertId = 0;
    this.timeout = options.timeout;
    this.queryTimeout = null;
    this._rows = [];
    this._fields = [];
    this._result = [];
    this._fieldCount = 0;
    this._rowParser = null;
    this._executeOptions = options;
    this._resultIndex = 0;
    this._localStream = null;
    this._unpipeStream = function() {
    };
    this._streamFactory = options.infileStreamFactory;
    this._connection = null;
  }
  buildParserFromFields(fields2, connection2) {
    if (this.options.disableEval) {
      return getStaticBinaryParser(fields2, this.options, connection2.config);
    }
    return getBinaryParser(fields2, this.options, connection2.config);
  }
  start(packet2, connection2) {
    this._connection = connection2;
    this.options = Object.assign({}, connection2.config, this._executeOptions);
    this._setTimeout();
    const executePacket = new Packets$5.Execute(
      this.statement.id,
      this.parameters,
      connection2.config.charsetNumber,
      connection2.config.timezone
    );
    try {
      connection2.writePacket(executePacket.toPacket(1));
    } catch (error) {
      this.onResult(error);
    }
    return Execute2.prototype.resultsetHeader;
  }
  readField(packet2, connection2) {
    let fields2;
    const field = new Packets$5.ColumnDefinition(
      packet2,
      connection2.clientEncoding
    );
    this._receivedFieldsCount++;
    this._fields[this._resultIndex].push(field);
    if (this._receivedFieldsCount === this._fieldCount) {
      fields2 = this._fields[this._resultIndex];
      this.emit("fields", fields2, this._resultIndex);
      return Execute2.prototype.fieldsEOF;
    }
    return Execute2.prototype.readField;
  }
  fieldsEOF(packet2, connection2) {
    if (!packet2.isEOF()) {
      return connection2.protocolError("Expected EOF packet");
    }
    this._rowParser = new (this.buildParserFromFields(
      this._fields[this._resultIndex],
      connection2
    ))();
    return Execute2.prototype.row;
  }
};
Execute$2.prototype.done = Query$1.prototype.done;
Execute$2.prototype.doneInsert = Query$1.prototype.doneInsert;
Execute$2.prototype.resultsetHeader = Query$1.prototype.resultsetHeader;
Execute$2.prototype._findOrCreateReadStream = Query$1.prototype._findOrCreateReadStream;
Execute$2.prototype._streamLocalInfile = Query$1.prototype._streamLocalInfile;
Execute$2.prototype._setTimeout = Query$1.prototype._setTimeout;
Execute$2.prototype._handleTimeoutError = Query$1.prototype._handleTimeoutError;
Execute$2.prototype.row = Query$1.prototype.row;
Execute$2.prototype.stream = Query$1.prototype.stream;
var execute = Execute$2;
const Packets$4 = packetsExports;
const Command$5 = command;
const CloseStatement3 = close_statement;
const Execute$1 = execute;
class PreparedStatementInfo {
  constructor(query2, id, columns, parameters, connection2) {
    this.query = query2;
    this.id = id;
    this.columns = columns;
    this.parameters = parameters;
    this.rowParser = null;
    this._connection = connection2;
  }
  close() {
    return this._connection.addCommand(new CloseStatement3(this.id));
  }
  execute(parameters, callback) {
    if (typeof parameters === "function") {
      callback = parameters;
      parameters = [];
    }
    return this._connection.addCommand(
      new Execute$1({ statement: this, values: parameters }, callback)
    );
  }
}
let Prepare$1 = class Prepare extends Command$5 {
  constructor(options, callback) {
    super();
    this.query = options.sql;
    this.onResult = callback;
    this.id = 0;
    this.fieldCount = 0;
    this.parameterCount = 0;
    this.fields = [];
    this.parameterDefinitions = [];
    this.options = options;
  }
  start(packet2, connection2) {
    const Connection3 = connection2.constructor;
    this.key = Connection3.statementKey(this.options);
    const statement = connection2._statements.get(this.key);
    if (statement) {
      if (this.onResult) {
        this.onResult(null, statement);
      }
      return null;
    }
    const cmdPacket = new Packets$4.PrepareStatement(
      this.query,
      connection2.config.charsetNumber,
      this.options.values
    );
    connection2.writePacket(cmdPacket.toPacket(1));
    return Prepare.prototype.prepareHeader;
  }
  prepareHeader(packet2, connection2) {
    const header = new Packets$4.PreparedStatementHeader(packet2);
    this.id = header.id;
    this.fieldCount = header.fieldCount;
    this.parameterCount = header.parameterCount;
    if (this.parameterCount > 0) {
      return Prepare.prototype.readParameter;
    }
    if (this.fieldCount > 0) {
      return Prepare.prototype.readField;
    }
    return this.prepareDone(connection2);
  }
  readParameter(packet2, connection2) {
    if (packet2.isEOF()) {
      if (this.fieldCount > 0) {
        return Prepare.prototype.readField;
      }
      return this.prepareDone(connection2);
    }
    const def = new Packets$4.ColumnDefinition(packet2, connection2.clientEncoding);
    this.parameterDefinitions.push(def);
    if (this.parameterDefinitions.length === this.parameterCount) {
      return Prepare.prototype.parametersEOF;
    }
    return this.readParameter;
  }
  readField(packet2, connection2) {
    if (packet2.isEOF()) {
      return this.prepareDone(connection2);
    }
    const def = new Packets$4.ColumnDefinition(packet2, connection2.clientEncoding);
    this.fields.push(def);
    if (this.fields.length === this.fieldCount) {
      return Prepare.prototype.fieldsEOF;
    }
    return Prepare.prototype.readField;
  }
  parametersEOF(packet2, connection2) {
    if (!packet2.isEOF()) {
      return connection2.protocolError("Expected EOF packet after parameters");
    }
    if (this.fieldCount > 0) {
      return Prepare.prototype.readField;
    }
    return this.prepareDone(connection2);
  }
  fieldsEOF(packet2, connection2) {
    if (!packet2.isEOF()) {
      return connection2.protocolError("Expected EOF packet after fields");
    }
    return this.prepareDone(connection2);
  }
  prepareDone(connection2) {
    const statement = new PreparedStatementInfo(
      this.query,
      this.id,
      this.fields,
      this.parameterDefinitions,
      connection2
    );
    connection2._statements.set(this.key, statement);
    if (this.onResult) {
      this.onResult(null, statement);
    }
    return null;
  }
};
var prepare = Prepare$1;
const Command$4 = command;
const CommandCode$1 = commands$1;
const Packet$1 = packet;
let Ping$1 = class Ping extends Command$4 {
  constructor(callback) {
    super();
    this.onResult = callback;
  }
  start(packet2, connection2) {
    const ping2 = new Packet$1(
      0,
      Buffer.from([1, 0, 0, 0, CommandCode$1.PING]),
      0,
      5
    );
    connection2.writePacket(ping2);
    return Ping.prototype.pingResponse;
  }
  pingResponse() {
    if (this.onResult) {
      process.nextTick(this.onResult.bind(this));
    }
    return null;
  }
};
var ping = Ping$1;
const Command$3 = command;
const Packets$3 = packetsExports;
let RegisterSlave$1 = class RegisterSlave2 extends Command$3 {
  constructor(opts, callback) {
    super();
    this.onResult = callback;
    this.opts = opts;
  }
  start(packet2, connection2) {
    const newPacket = new Packets$3.RegisterSlave(this.opts);
    connection2.writePacket(newPacket.toPacket(1));
    return RegisterSlave2.prototype.registerResponse;
  }
  registerResponse() {
    if (this.onResult) {
      process.nextTick(this.onResult.bind(this));
    }
    return null;
  }
};
var register_slave = RegisterSlave$1;
var binlog_query_statusvars;
var hasRequiredBinlog_query_statusvars;
function requireBinlog_query_statusvars() {
  if (hasRequiredBinlog_query_statusvars) return binlog_query_statusvars;
  hasRequiredBinlog_query_statusvars = 1;
  const keys = {
    FLAGS2: 0,
    SQL_MODE: 1,
    CATALOG: 2,
    CHARSET: 4,
    TIME_ZONE: 5,
    CATALOG_NZ: 6,
    LC_TIME_NAMES: 7,
    CHARSET_DATABASE: 8,
    TABLE_MAP_FOR_UPDATE: 9,
    MASTER_DATA_WRITTEN: 10,
    INVOKERS: 11,
    UPDATED_DB_NAMES: 12,
    MICROSECONDS: 3
  };
  binlog_query_statusvars = function parseStatusVars(buffer) {
    const result = {};
    let offset = 0;
    let key, length2, prevOffset;
    while (offset < buffer.length) {
      key = buffer[offset++];
      switch (key) {
        case keys.FLAGS2:
          result.flags = buffer.readUInt32LE(offset);
          offset += 4;
          break;
        case keys.SQL_MODE:
          result.sqlMode = buffer.readUInt32LE(offset);
          offset += 8;
          break;
        case keys.CATALOG:
          length2 = buffer[offset++];
          result.catalog = buffer.toString("utf8", offset, offset + length2);
          offset += length2 + 1;
          break;
        case keys.CHARSET:
          result.clientCharset = buffer.readUInt16LE(offset);
          result.connectionCollation = buffer.readUInt16LE(offset + 2);
          result.serverCharset = buffer.readUInt16LE(offset + 4);
          offset += 6;
          break;
        case keys.TIME_ZONE:
          length2 = buffer[offset++];
          result.timeZone = buffer.toString("utf8", offset, offset + length2);
          offset += length2;
          break;
        case keys.CATALOG_NZ:
          length2 = buffer[offset++];
          result.catalogNz = buffer.toString("utf8", offset, offset + length2);
          offset += length2;
          break;
        case keys.LC_TIME_NAMES:
          result.lcTimeNames = buffer.readUInt16LE(offset);
          offset += 2;
          break;
        case keys.CHARSET_DATABASE:
          result.schemaCharset = buffer.readUInt16LE(offset);
          offset += 2;
          break;
        case keys.TABLE_MAP_FOR_UPDATE:
          result.mapForUpdate1 = buffer.readUInt32LE(offset);
          result.mapForUpdate2 = buffer.readUInt32LE(offset + 4);
          offset += 8;
          break;
        case keys.MASTER_DATA_WRITTEN:
          result.masterDataWritten = buffer.readUInt32LE(offset);
          offset += 4;
          break;
        case keys.INVOKERS:
          length2 = buffer[offset++];
          result.invokerUsername = buffer.toString(
            "utf8",
            offset,
            offset + length2
          );
          offset += length2;
          length2 = buffer[offset++];
          result.invokerHostname = buffer.toString(
            "utf8",
            offset,
            offset + length2
          );
          offset += length2;
          break;
        case keys.UPDATED_DB_NAMES:
          length2 = buffer[offset++];
          result.updatedDBs = [];
          for (; length2; --length2) {
            prevOffset = offset;
            while (buffer[offset++] && offset < buffer.length) {
            }
            result.updatedDBs.push(
              buffer.toString("utf8", prevOffset, offset - 1)
            );
          }
          break;
        case keys.MICROSECONDS:
          result.microseconds = // REVIEW: INVALID UNKNOWN VARIABLE!
          buffer.readInt16LE(offset) + (buffer[offset + 2] << 16);
          offset += 3;
      }
    }
    return result;
  };
  return binlog_query_statusvars;
}
const Command$2 = command;
const Packets$2 = packetsExports;
const eventParsers = [];
class BinlogEventHeader {
  constructor(packet2) {
    this.timestamp = packet2.readInt32();
    this.eventType = packet2.readInt8();
    this.serverId = packet2.readInt32();
    this.eventSize = packet2.readInt32();
    this.logPos = packet2.readInt32();
    this.flags = packet2.readInt16();
  }
}
let BinlogDump$1 = class BinlogDump2 extends Command$2 {
  constructor(opts) {
    super();
    this.opts = opts;
  }
  start(packet2, connection2) {
    const newPacket = new Packets$2.BinlogDump(this.opts);
    connection2.writePacket(newPacket.toPacket(1));
    return BinlogDump2.prototype.binlogData;
  }
  binlogData(packet2) {
    if (packet2.isEOF()) {
      this.emit("eof");
      return null;
    }
    packet2.readInt8();
    const header = new BinlogEventHeader(packet2);
    const EventParser = eventParsers[header.eventType];
    let event;
    if (EventParser) {
      event = new EventParser(packet2);
    } else {
      event = {
        name: "UNKNOWN"
      };
    }
    event.header = header;
    this.emit("event", event);
    return BinlogDump2.prototype.binlogData;
  }
};
class RotateEvent {
  constructor(packet2) {
    this.pposition = packet2.readInt32();
    packet2.readInt32();
    this.nextBinlog = packet2.readString();
    this.name = "RotateEvent";
  }
}
class FormatDescriptionEvent {
  constructor(packet2) {
    this.binlogVersion = packet2.readInt16();
    this.serverVersion = packet2.readString(50).replace(/\u0000.*/, "");
    this.createTimestamp = packet2.readInt32();
    this.eventHeaderLength = packet2.readInt8();
    this.eventsLength = packet2.readBuffer();
    this.name = "FormatDescriptionEvent";
  }
}
class QueryEvent {
  constructor(packet2) {
    const parseStatusVars = requireBinlog_query_statusvars();
    this.slaveProxyId = packet2.readInt32();
    this.executionTime = packet2.readInt32();
    const schemaLength = packet2.readInt8();
    this.errorCode = packet2.readInt16();
    const statusVarsLength = packet2.readInt16();
    const statusVars = packet2.readBuffer(statusVarsLength);
    this.schema = packet2.readString(schemaLength);
    packet2.readInt8();
    this.statusVars = parseStatusVars(statusVars);
    this.query = packet2.readString();
    this.name = "QueryEvent";
  }
}
class XidEvent {
  constructor(packet2) {
    this.binlogVersion = packet2.readInt16();
    this.xid = packet2.readInt64();
    this.name = "XidEvent";
  }
}
eventParsers[2] = QueryEvent;
eventParsers[4] = RotateEvent;
eventParsers[15] = FormatDescriptionEvent;
eventParsers[16] = XidEvent;
var binlog_dump = BinlogDump$1;
const Command$1 = command;
const Packets$1 = packetsExports;
const ClientConstants = client;
const ClientHandshake$1 = client_handshake;
const CharsetToEncoding$1 = requireCharset_encodings();
let ChangeUser$1 = class ChangeUser2 extends Command$1 {
  constructor(options, callback) {
    super();
    this.onResult = callback;
    this.user = options.user;
    this.password = options.password;
    this.password1 = options.password;
    this.password2 = options.password2;
    this.password3 = options.password3;
    this.database = options.database;
    this.passwordSha1 = options.passwordSha1;
    this.charsetNumber = options.charsetNumber;
    this.currentConfig = options.currentConfig;
    this.authenticationFactor = 0;
  }
  start(packet2, connection2) {
    const newPacket = new Packets$1.ChangeUser({
      flags: connection2.config.clientFlags,
      user: this.user,
      database: this.database,
      charsetNumber: this.charsetNumber,
      password: this.password,
      passwordSha1: this.passwordSha1,
      authPluginData1: connection2._handshakePacket.authPluginData1,
      authPluginData2: connection2._handshakePacket.authPluginData2
    });
    this.currentConfig.user = this.user;
    this.currentConfig.password = this.password;
    this.currentConfig.database = this.database;
    this.currentConfig.charsetNumber = this.charsetNumber;
    connection2.clientEncoding = CharsetToEncoding$1[this.charsetNumber];
    connection2._statements.clear();
    connection2.writePacket(newPacket.toPacket());
    const multiFactorAuthentication = connection2.serverCapabilityFlags & ClientConstants.MULTI_FACTOR_AUTHENTICATION;
    if (multiFactorAuthentication) {
      this.authenticationFactor = 1;
    }
    return ChangeUser2.prototype.handshakeResult;
  }
};
ChangeUser$1.prototype.handshakeResult = ClientHandshake$1.prototype.handshakeResult;
ChangeUser$1.prototype.calculateNativePasswordAuthToken = ClientHandshake$1.prototype.calculateNativePasswordAuthToken;
var change_user = ChangeUser$1;
const Command2 = command;
const CommandCode = commands$1;
const Packet2 = packet;
let Quit$1 = class Quit extends Command2 {
  constructor(callback) {
    super();
    this.onResult = callback;
  }
  start(packet2, connection2) {
    connection2._closing = true;
    const quit2 = new Packet2(
      0,
      Buffer.from([1, 0, 0, 0, CommandCode.QUIT]),
      0,
      5
    );
    if (this.onResult) {
      this.onResult();
    }
    connection2.writePacket(quit2);
    return null;
  }
};
var quit = Quit$1;
const ClientHandshake2 = client_handshake;
const ServerHandshake2 = server_handshake;
const Query3 = query;
const Prepare2 = prepare;
const Execute3 = execute;
const Ping2 = ping;
const RegisterSlave3 = register_slave;
const BinlogDump3 = binlog_dump;
const ChangeUser3 = change_user;
const Quit2 = quit;
var commands = {
  ClientHandshake: ClientHandshake2,
  ServerHandshake: ServerHandshake2,
  Query: Query3,
  Prepare: Prepare2,
  Execute: Execute3,
  Ping: Ping2,
  RegisterSlave: RegisterSlave3,
  BinlogDump: BinlogDump3,
  ChangeUser: ChangeUser3,
  Quit: Quit2
};
var namedPlaceholders = { exports: {} };
var lruCache;
var hasRequiredLruCache;
function requireLruCache() {
  if (hasRequiredLruCache) return lruCache;
  hasRequiredLruCache = 1;
  const perf = typeof performance === "object" && performance && typeof performance.now === "function" ? performance : Date;
  const hasAbortController = typeof AbortController === "function";
  const AC = hasAbortController ? AbortController : class AbortController {
    constructor() {
      this.signal = new AS();
    }
    abort(reason = new Error("This operation was aborted")) {
      this.signal.reason = this.signal.reason || reason;
      this.signal.aborted = true;
      this.signal.dispatchEvent({
        type: "abort",
        target: this.signal
      });
    }
  };
  const hasAbortSignal = typeof AbortSignal === "function";
  const hasACAbortSignal = typeof AC.AbortSignal === "function";
  const AS = hasAbortSignal ? AbortSignal : hasACAbortSignal ? AC.AbortController : class AbortSignal {
    constructor() {
      this.reason = void 0;
      this.aborted = false;
      this._listeners = [];
    }
    dispatchEvent(e) {
      if (e.type === "abort") {
        this.aborted = true;
        this.onabort(e);
        this._listeners.forEach((f) => f(e), this);
      }
    }
    onabort() {
    }
    addEventListener(ev, fn) {
      if (ev === "abort") {
        this._listeners.push(fn);
      }
    }
    removeEventListener(ev, fn) {
      if (ev === "abort") {
        this._listeners = this._listeners.filter((f) => f !== fn);
      }
    }
  };
  const warned = /* @__PURE__ */ new Set();
  const deprecatedOption = (opt, instead) => {
    const code = `LRU_CACHE_OPTION_${opt}`;
    if (shouldWarn(code)) {
      warn(code, `${opt} option`, `options.${instead}`, LRUCache);
    }
  };
  const deprecatedMethod = (method, instead) => {
    const code = `LRU_CACHE_METHOD_${method}`;
    if (shouldWarn(code)) {
      const { prototype } = LRUCache;
      const { get: get2 } = Object.getOwnPropertyDescriptor(prototype, method);
      warn(code, `${method} method`, `cache.${instead}()`, get2);
    }
  };
  const deprecatedProperty = (field, instead) => {
    const code = `LRU_CACHE_PROPERTY_${field}`;
    if (shouldWarn(code)) {
      const { prototype } = LRUCache;
      const { get: get2 } = Object.getOwnPropertyDescriptor(prototype, field);
      warn(code, `${field} property`, `cache.${instead}`, get2);
    }
  };
  const emitWarning = (...a) => {
    typeof process === "object" && process && typeof process.emitWarning === "function" ? process.emitWarning(...a) : console.error(...a);
  };
  const shouldWarn = (code) => !warned.has(code);
  const warn = (code, what, instead, fn) => {
    warned.add(code);
    const msg = `The ${what} is deprecated. Please use ${instead} instead.`;
    emitWarning(msg, "DeprecationWarning", code, fn);
  };
  const isPosInt = (n) => n && n === Math.floor(n) && n > 0 && isFinite(n);
  const getUintArray = (max) => !isPosInt(max) ? null : max <= Math.pow(2, 8) ? Uint8Array : max <= Math.pow(2, 16) ? Uint16Array : max <= Math.pow(2, 32) ? Uint32Array : max <= Number.MAX_SAFE_INTEGER ? ZeroArray : null;
  class ZeroArray extends Array {
    constructor(size2) {
      super(size2);
      this.fill(0);
    }
  }
  class Stack {
    constructor(max) {
      if (max === 0) {
        return [];
      }
      const UintArray = getUintArray(max);
      this.heap = new UintArray(max);
      this.length = 0;
    }
    push(n) {
      this.heap[this.length++] = n;
    }
    pop() {
      return this.heap[--this.length];
    }
  }
  class LRUCache {
    constructor(options = {}) {
      const {
        max = 0,
        ttl,
        ttlResolution = 1,
        ttlAutopurge,
        updateAgeOnGet,
        updateAgeOnHas,
        allowStale,
        dispose,
        disposeAfter,
        noDisposeOnSet,
        noUpdateTTL,
        maxSize = 0,
        maxEntrySize = 0,
        sizeCalculation,
        fetchMethod,
        fetchContext,
        noDeleteOnFetchRejection,
        noDeleteOnStaleGet,
        allowStaleOnFetchRejection,
        allowStaleOnFetchAbort,
        ignoreFetchAbort
      } = options;
      const { length: length2, maxAge, stale } = options instanceof LRUCache ? {} : options;
      if (max !== 0 && !isPosInt(max)) {
        throw new TypeError("max option must be a nonnegative integer");
      }
      const UintArray = max ? getUintArray(max) : Array;
      if (!UintArray) {
        throw new Error("invalid max value: " + max);
      }
      this.max = max;
      this.maxSize = maxSize;
      this.maxEntrySize = maxEntrySize || this.maxSize;
      this.sizeCalculation = sizeCalculation || length2;
      if (this.sizeCalculation) {
        if (!this.maxSize && !this.maxEntrySize) {
          throw new TypeError(
            "cannot set sizeCalculation without setting maxSize or maxEntrySize"
          );
        }
        if (typeof this.sizeCalculation !== "function") {
          throw new TypeError("sizeCalculation set to non-function");
        }
      }
      this.fetchMethod = fetchMethod || null;
      if (this.fetchMethod && typeof this.fetchMethod !== "function") {
        throw new TypeError(
          "fetchMethod must be a function if specified"
        );
      }
      this.fetchContext = fetchContext;
      if (!this.fetchMethod && fetchContext !== void 0) {
        throw new TypeError(
          "cannot set fetchContext without fetchMethod"
        );
      }
      this.keyMap = /* @__PURE__ */ new Map();
      this.keyList = new Array(max).fill(null);
      this.valList = new Array(max).fill(null);
      this.next = new UintArray(max);
      this.prev = new UintArray(max);
      this.head = 0;
      this.tail = 0;
      this.free = new Stack(max);
      this.initialFill = 1;
      this.size = 0;
      if (typeof dispose === "function") {
        this.dispose = dispose;
      }
      if (typeof disposeAfter === "function") {
        this.disposeAfter = disposeAfter;
        this.disposed = [];
      } else {
        this.disposeAfter = null;
        this.disposed = null;
      }
      this.noDisposeOnSet = !!noDisposeOnSet;
      this.noUpdateTTL = !!noUpdateTTL;
      this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection;
      this.allowStaleOnFetchRejection = !!allowStaleOnFetchRejection;
      this.allowStaleOnFetchAbort = !!allowStaleOnFetchAbort;
      this.ignoreFetchAbort = !!ignoreFetchAbort;
      if (this.maxEntrySize !== 0) {
        if (this.maxSize !== 0) {
          if (!isPosInt(this.maxSize)) {
            throw new TypeError(
              "maxSize must be a positive integer if specified"
            );
          }
        }
        if (!isPosInt(this.maxEntrySize)) {
          throw new TypeError(
            "maxEntrySize must be a positive integer if specified"
          );
        }
        this.initializeSizeTracking();
      }
      this.allowStale = !!allowStale || !!stale;
      this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
      this.updateAgeOnGet = !!updateAgeOnGet;
      this.updateAgeOnHas = !!updateAgeOnHas;
      this.ttlResolution = isPosInt(ttlResolution) || ttlResolution === 0 ? ttlResolution : 1;
      this.ttlAutopurge = !!ttlAutopurge;
      this.ttl = ttl || maxAge || 0;
      if (this.ttl) {
        if (!isPosInt(this.ttl)) {
          throw new TypeError(
            "ttl must be a positive integer if specified"
          );
        }
        this.initializeTTLTracking();
      }
      if (this.max === 0 && this.ttl === 0 && this.maxSize === 0) {
        throw new TypeError(
          "At least one of max, maxSize, or ttl is required"
        );
      }
      if (!this.ttlAutopurge && !this.max && !this.maxSize) {
        const code = "LRU_CACHE_UNBOUNDED";
        if (shouldWarn(code)) {
          warned.add(code);
          const msg = "TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.";
          emitWarning(msg, "UnboundedCacheWarning", code, LRUCache);
        }
      }
      if (stale) {
        deprecatedOption("stale", "allowStale");
      }
      if (maxAge) {
        deprecatedOption("maxAge", "ttl");
      }
      if (length2) {
        deprecatedOption("length", "sizeCalculation");
      }
    }
    getRemainingTTL(key) {
      return this.has(key, { updateAgeOnHas: false }) ? Infinity : 0;
    }
    initializeTTLTracking() {
      this.ttls = new ZeroArray(this.max);
      this.starts = new ZeroArray(this.max);
      this.setItemTTL = (index2, ttl, start = perf.now()) => {
        this.starts[index2] = ttl !== 0 ? start : 0;
        this.ttls[index2] = ttl;
        if (ttl !== 0 && this.ttlAutopurge) {
          const t = setTimeout(() => {
            if (this.isStale(index2)) {
              this.delete(this.keyList[index2]);
            }
          }, ttl + 1);
          if (t.unref) {
            t.unref();
          }
        }
      };
      this.updateItemAge = (index2) => {
        this.starts[index2] = this.ttls[index2] !== 0 ? perf.now() : 0;
      };
      this.statusTTL = (status, index2) => {
        if (status) {
          status.ttl = this.ttls[index2];
          status.start = this.starts[index2];
          status.now = cachedNow || getNow();
          status.remainingTTL = status.now + status.ttl - status.start;
        }
      };
      let cachedNow = 0;
      const getNow = () => {
        const n = perf.now();
        if (this.ttlResolution > 0) {
          cachedNow = n;
          const t = setTimeout(
            () => cachedNow = 0,
            this.ttlResolution
          );
          if (t.unref) {
            t.unref();
          }
        }
        return n;
      };
      this.getRemainingTTL = (key) => {
        const index2 = this.keyMap.get(key);
        if (index2 === void 0) {
          return 0;
        }
        return this.ttls[index2] === 0 || this.starts[index2] === 0 ? Infinity : this.starts[index2] + this.ttls[index2] - (cachedNow || getNow());
      };
      this.isStale = (index2) => {
        return this.ttls[index2] !== 0 && this.starts[index2] !== 0 && (cachedNow || getNow()) - this.starts[index2] > this.ttls[index2];
      };
    }
    updateItemAge(_index) {
    }
    statusTTL(_status, _index) {
    }
    setItemTTL(_index, _ttl, _start) {
    }
    isStale(_index) {
      return false;
    }
    initializeSizeTracking() {
      this.calculatedSize = 0;
      this.sizes = new ZeroArray(this.max);
      this.removeItemSize = (index2) => {
        this.calculatedSize -= this.sizes[index2];
        this.sizes[index2] = 0;
      };
      this.requireSize = (k, v, size2, sizeCalculation) => {
        if (this.isBackgroundFetch(v)) {
          return 0;
        }
        if (!isPosInt(size2)) {
          if (sizeCalculation) {
            if (typeof sizeCalculation !== "function") {
              throw new TypeError("sizeCalculation must be a function");
            }
            size2 = sizeCalculation(v, k);
            if (!isPosInt(size2)) {
              throw new TypeError(
                "sizeCalculation return invalid (expect positive integer)"
              );
            }
          } else {
            throw new TypeError(
              "invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set."
            );
          }
        }
        return size2;
      };
      this.addItemSize = (index2, size2, status) => {
        this.sizes[index2] = size2;
        if (this.maxSize) {
          const maxSize = this.maxSize - this.sizes[index2];
          while (this.calculatedSize > maxSize) {
            this.evict(true);
          }
        }
        this.calculatedSize += this.sizes[index2];
        if (status) {
          status.entrySize = size2;
          status.totalCalculatedSize = this.calculatedSize;
        }
      };
    }
    removeItemSize(_index) {
    }
    addItemSize(_index, _size) {
    }
    requireSize(_k, _v, size2, sizeCalculation) {
      if (size2 || sizeCalculation) {
        throw new TypeError(
          "cannot set size without setting maxSize or maxEntrySize on cache"
        );
      }
    }
    *indexes({ allowStale = this.allowStale } = {}) {
      if (this.size) {
        for (let i = this.tail; true; ) {
          if (!this.isValidIndex(i)) {
            break;
          }
          if (allowStale || !this.isStale(i)) {
            yield i;
          }
          if (i === this.head) {
            break;
          } else {
            i = this.prev[i];
          }
        }
      }
    }
    *rindexes({ allowStale = this.allowStale } = {}) {
      if (this.size) {
        for (let i = this.head; true; ) {
          if (!this.isValidIndex(i)) {
            break;
          }
          if (allowStale || !this.isStale(i)) {
            yield i;
          }
          if (i === this.tail) {
            break;
          } else {
            i = this.next[i];
          }
        }
      }
    }
    isValidIndex(index2) {
      return index2 !== void 0 && this.keyMap.get(this.keyList[index2]) === index2;
    }
    *entries() {
      for (const i of this.indexes()) {
        if (this.valList[i] !== void 0 && this.keyList[i] !== void 0 && !this.isBackgroundFetch(this.valList[i])) {
          yield [this.keyList[i], this.valList[i]];
        }
      }
    }
    *rentries() {
      for (const i of this.rindexes()) {
        if (this.valList[i] !== void 0 && this.keyList[i] !== void 0 && !this.isBackgroundFetch(this.valList[i])) {
          yield [this.keyList[i], this.valList[i]];
        }
      }
    }
    *keys() {
      for (const i of this.indexes()) {
        if (this.keyList[i] !== void 0 && !this.isBackgroundFetch(this.valList[i])) {
          yield this.keyList[i];
        }
      }
    }
    *rkeys() {
      for (const i of this.rindexes()) {
        if (this.keyList[i] !== void 0 && !this.isBackgroundFetch(this.valList[i])) {
          yield this.keyList[i];
        }
      }
    }
    *values() {
      for (const i of this.indexes()) {
        if (this.valList[i] !== void 0 && !this.isBackgroundFetch(this.valList[i])) {
          yield this.valList[i];
        }
      }
    }
    *rvalues() {
      for (const i of this.rindexes()) {
        if (this.valList[i] !== void 0 && !this.isBackgroundFetch(this.valList[i])) {
          yield this.valList[i];
        }
      }
    }
    [Symbol.iterator]() {
      return this.entries();
    }
    find(fn, getOptions) {
      for (const i of this.indexes()) {
        const v = this.valList[i];
        const value = this.isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === void 0) continue;
        if (fn(value, this.keyList[i], this)) {
          return this.get(this.keyList[i], getOptions);
        }
      }
    }
    forEach(fn, thisp = this) {
      for (const i of this.indexes()) {
        const v = this.valList[i];
        const value = this.isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === void 0) continue;
        fn.call(thisp, value, this.keyList[i], this);
      }
    }
    rforEach(fn, thisp = this) {
      for (const i of this.rindexes()) {
        const v = this.valList[i];
        const value = this.isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === void 0) continue;
        fn.call(thisp, value, this.keyList[i], this);
      }
    }
    get prune() {
      deprecatedMethod("prune", "purgeStale");
      return this.purgeStale;
    }
    purgeStale() {
      let deleted = false;
      for (const i of this.rindexes({ allowStale: true })) {
        if (this.isStale(i)) {
          this.delete(this.keyList[i]);
          deleted = true;
        }
      }
      return deleted;
    }
    dump() {
      const arr = [];
      for (const i of this.indexes({ allowStale: true })) {
        const key = this.keyList[i];
        const v = this.valList[i];
        const value = this.isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === void 0) continue;
        const entry = { value };
        if (this.ttls) {
          entry.ttl = this.ttls[i];
          const age = perf.now() - this.starts[i];
          entry.start = Math.floor(Date.now() - age);
        }
        if (this.sizes) {
          entry.size = this.sizes[i];
        }
        arr.unshift([key, entry]);
      }
      return arr;
    }
    load(arr) {
      this.clear();
      for (const [key, entry] of arr) {
        if (entry.start) {
          const age = Date.now() - entry.start;
          entry.start = perf.now() - age;
        }
        this.set(key, entry.value, entry);
      }
    }
    dispose(_v, _k, _reason) {
    }
    set(k, v, {
      ttl = this.ttl,
      start,
      noDisposeOnSet = this.noDisposeOnSet,
      size: size2 = 0,
      sizeCalculation = this.sizeCalculation,
      noUpdateTTL = this.noUpdateTTL,
      status
    } = {}) {
      size2 = this.requireSize(k, v, size2, sizeCalculation);
      if (this.maxEntrySize && size2 > this.maxEntrySize) {
        if (status) {
          status.set = "miss";
          status.maxEntrySizeExceeded = true;
        }
        this.delete(k);
        return this;
      }
      let index2 = this.size === 0 ? void 0 : this.keyMap.get(k);
      if (index2 === void 0) {
        index2 = this.newIndex();
        this.keyList[index2] = k;
        this.valList[index2] = v;
        this.keyMap.set(k, index2);
        this.next[this.tail] = index2;
        this.prev[index2] = this.tail;
        this.tail = index2;
        this.size++;
        this.addItemSize(index2, size2, status);
        if (status) {
          status.set = "add";
        }
        noUpdateTTL = false;
      } else {
        this.moveToTail(index2);
        const oldVal = this.valList[index2];
        if (v !== oldVal) {
          if (this.isBackgroundFetch(oldVal)) {
            oldVal.__abortController.abort(new Error("replaced"));
          } else {
            if (!noDisposeOnSet) {
              this.dispose(oldVal, k, "set");
              if (this.disposeAfter) {
                this.disposed.push([oldVal, k, "set"]);
              }
            }
          }
          this.removeItemSize(index2);
          this.valList[index2] = v;
          this.addItemSize(index2, size2, status);
          if (status) {
            status.set = "replace";
            const oldValue = oldVal && this.isBackgroundFetch(oldVal) ? oldVal.__staleWhileFetching : oldVal;
            if (oldValue !== void 0) status.oldValue = oldValue;
          }
        } else if (status) {
          status.set = "update";
        }
      }
      if (ttl !== 0 && this.ttl === 0 && !this.ttls) {
        this.initializeTTLTracking();
      }
      if (!noUpdateTTL) {
        this.setItemTTL(index2, ttl, start);
      }
      this.statusTTL(status, index2);
      if (this.disposeAfter) {
        while (this.disposed.length) {
          this.disposeAfter(...this.disposed.shift());
        }
      }
      return this;
    }
    newIndex() {
      if (this.size === 0) {
        return this.tail;
      }
      if (this.size === this.max && this.max !== 0) {
        return this.evict(false);
      }
      if (this.free.length !== 0) {
        return this.free.pop();
      }
      return this.initialFill++;
    }
    pop() {
      if (this.size) {
        const val = this.valList[this.head];
        this.evict(true);
        return val;
      }
    }
    evict(free) {
      const head = this.head;
      const k = this.keyList[head];
      const v = this.valList[head];
      if (this.isBackgroundFetch(v)) {
        v.__abortController.abort(new Error("evicted"));
      } else {
        this.dispose(v, k, "evict");
        if (this.disposeAfter) {
          this.disposed.push([v, k, "evict"]);
        }
      }
      this.removeItemSize(head);
      if (free) {
        this.keyList[head] = null;
        this.valList[head] = null;
        this.free.push(head);
      }
      this.head = this.next[head];
      this.keyMap.delete(k);
      this.size--;
      return head;
    }
    has(k, { updateAgeOnHas = this.updateAgeOnHas, status } = {}) {
      const index2 = this.keyMap.get(k);
      if (index2 !== void 0) {
        if (!this.isStale(index2)) {
          if (updateAgeOnHas) {
            this.updateItemAge(index2);
          }
          if (status) status.has = "hit";
          this.statusTTL(status, index2);
          return true;
        } else if (status) {
          status.has = "stale";
          this.statusTTL(status, index2);
        }
      } else if (status) {
        status.has = "miss";
      }
      return false;
    }
    // like get(), but without any LRU updating or TTL expiration
    peek(k, { allowStale = this.allowStale } = {}) {
      const index2 = this.keyMap.get(k);
      if (index2 !== void 0 && (allowStale || !this.isStale(index2))) {
        const v = this.valList[index2];
        return this.isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      }
    }
    backgroundFetch(k, index2, options, context) {
      const v = index2 === void 0 ? void 0 : this.valList[index2];
      if (this.isBackgroundFetch(v)) {
        return v;
      }
      const ac = new AC();
      if (options.signal) {
        options.signal.addEventListener(
          "abort",
          () => ac.abort(options.signal.reason)
        );
      }
      const fetchOpts = {
        signal: ac.signal,
        options,
        context
      };
      const cb = (v2, updateCache = false) => {
        const { aborted } = ac.signal;
        const ignoreAbort = options.ignoreFetchAbort && v2 !== void 0;
        if (options.status) {
          if (aborted && !updateCache) {
            options.status.fetchAborted = true;
            options.status.fetchError = ac.signal.reason;
            if (ignoreAbort) options.status.fetchAbortIgnored = true;
          } else {
            options.status.fetchResolved = true;
          }
        }
        if (aborted && !ignoreAbort && !updateCache) {
          return fetchFail(ac.signal.reason);
        }
        if (this.valList[index2] === p) {
          if (v2 === void 0) {
            if (p.__staleWhileFetching) {
              this.valList[index2] = p.__staleWhileFetching;
            } else {
              this.delete(k);
            }
          } else {
            if (options.status) options.status.fetchUpdated = true;
            this.set(k, v2, fetchOpts.options);
          }
        }
        return v2;
      };
      const eb = (er) => {
        if (options.status) {
          options.status.fetchRejected = true;
          options.status.fetchError = er;
        }
        return fetchFail(er);
      };
      const fetchFail = (er) => {
        const { aborted } = ac.signal;
        const allowStaleAborted = aborted && options.allowStaleOnFetchAbort;
        const allowStale = allowStaleAborted || options.allowStaleOnFetchRejection;
        const noDelete = allowStale || options.noDeleteOnFetchRejection;
        if (this.valList[index2] === p) {
          const del = !noDelete || p.__staleWhileFetching === void 0;
          if (del) {
            this.delete(k);
          } else if (!allowStaleAborted) {
            this.valList[index2] = p.__staleWhileFetching;
          }
        }
        if (allowStale) {
          if (options.status && p.__staleWhileFetching !== void 0) {
            options.status.returnedStale = true;
          }
          return p.__staleWhileFetching;
        } else if (p.__returned === p) {
          throw er;
        }
      };
      const pcall = (res, rej) => {
        this.fetchMethod(k, v, fetchOpts).then((v2) => res(v2), rej);
        ac.signal.addEventListener("abort", () => {
          if (!options.ignoreFetchAbort || options.allowStaleOnFetchAbort) {
            res();
            if (options.allowStaleOnFetchAbort) {
              res = (v2) => cb(v2, true);
            }
          }
        });
      };
      if (options.status) options.status.fetchDispatched = true;
      const p = new Promise(pcall).then(cb, eb);
      p.__abortController = ac;
      p.__staleWhileFetching = v;
      p.__returned = null;
      if (index2 === void 0) {
        this.set(k, p, { ...fetchOpts.options, status: void 0 });
        index2 = this.keyMap.get(k);
      } else {
        this.valList[index2] = p;
      }
      return p;
    }
    isBackgroundFetch(p) {
      return p && typeof p === "object" && typeof p.then === "function" && Object.prototype.hasOwnProperty.call(
        p,
        "__staleWhileFetching"
      ) && Object.prototype.hasOwnProperty.call(p, "__returned") && (p.__returned === p || p.__returned === null);
    }
    // this takes the union of get() and set() opts, because it does both
    async fetch(k, {
      // get options
      allowStale = this.allowStale,
      updateAgeOnGet = this.updateAgeOnGet,
      noDeleteOnStaleGet = this.noDeleteOnStaleGet,
      // set options
      ttl = this.ttl,
      noDisposeOnSet = this.noDisposeOnSet,
      size: size2 = 0,
      sizeCalculation = this.sizeCalculation,
      noUpdateTTL = this.noUpdateTTL,
      // fetch exclusive options
      noDeleteOnFetchRejection = this.noDeleteOnFetchRejection,
      allowStaleOnFetchRejection = this.allowStaleOnFetchRejection,
      ignoreFetchAbort = this.ignoreFetchAbort,
      allowStaleOnFetchAbort = this.allowStaleOnFetchAbort,
      fetchContext = this.fetchContext,
      forceRefresh = false,
      status,
      signal
    } = {}) {
      if (!this.fetchMethod) {
        if (status) status.fetch = "get";
        return this.get(k, {
          allowStale,
          updateAgeOnGet,
          noDeleteOnStaleGet,
          status
        });
      }
      const options = {
        allowStale,
        updateAgeOnGet,
        noDeleteOnStaleGet,
        ttl,
        noDisposeOnSet,
        size: size2,
        sizeCalculation,
        noUpdateTTL,
        noDeleteOnFetchRejection,
        allowStaleOnFetchRejection,
        allowStaleOnFetchAbort,
        ignoreFetchAbort,
        status,
        signal
      };
      let index2 = this.keyMap.get(k);
      if (index2 === void 0) {
        if (status) status.fetch = "miss";
        const p = this.backgroundFetch(k, index2, options, fetchContext);
        return p.__returned = p;
      } else {
        const v = this.valList[index2];
        if (this.isBackgroundFetch(v)) {
          const stale = allowStale && v.__staleWhileFetching !== void 0;
          if (status) {
            status.fetch = "inflight";
            if (stale) status.returnedStale = true;
          }
          return stale ? v.__staleWhileFetching : v.__returned = v;
        }
        const isStale = this.isStale(index2);
        if (!forceRefresh && !isStale) {
          if (status) status.fetch = "hit";
          this.moveToTail(index2);
          if (updateAgeOnGet) {
            this.updateItemAge(index2);
          }
          this.statusTTL(status, index2);
          return v;
        }
        const p = this.backgroundFetch(k, index2, options, fetchContext);
        const hasStale = p.__staleWhileFetching !== void 0;
        const staleVal = hasStale && allowStale;
        if (status) {
          status.fetch = hasStale && isStale ? "stale" : "refresh";
          if (staleVal && isStale) status.returnedStale = true;
        }
        return staleVal ? p.__staleWhileFetching : p.__returned = p;
      }
    }
    get(k, {
      allowStale = this.allowStale,
      updateAgeOnGet = this.updateAgeOnGet,
      noDeleteOnStaleGet = this.noDeleteOnStaleGet,
      status
    } = {}) {
      const index2 = this.keyMap.get(k);
      if (index2 !== void 0) {
        const value = this.valList[index2];
        const fetching = this.isBackgroundFetch(value);
        this.statusTTL(status, index2);
        if (this.isStale(index2)) {
          if (status) status.get = "stale";
          if (!fetching) {
            if (!noDeleteOnStaleGet) {
              this.delete(k);
            }
            if (status) status.returnedStale = allowStale;
            return allowStale ? value : void 0;
          } else {
            if (status) {
              status.returnedStale = allowStale && value.__staleWhileFetching !== void 0;
            }
            return allowStale ? value.__staleWhileFetching : void 0;
          }
        } else {
          if (status) status.get = "hit";
          if (fetching) {
            return value.__staleWhileFetching;
          }
          this.moveToTail(index2);
          if (updateAgeOnGet) {
            this.updateItemAge(index2);
          }
          return value;
        }
      } else if (status) {
        status.get = "miss";
      }
    }
    connect(p, n) {
      this.prev[n] = p;
      this.next[p] = n;
    }
    moveToTail(index2) {
      if (index2 !== this.tail) {
        if (index2 === this.head) {
          this.head = this.next[index2];
        } else {
          this.connect(this.prev[index2], this.next[index2]);
        }
        this.connect(this.tail, index2);
        this.tail = index2;
      }
    }
    get del() {
      deprecatedMethod("del", "delete");
      return this.delete;
    }
    delete(k) {
      let deleted = false;
      if (this.size !== 0) {
        const index2 = this.keyMap.get(k);
        if (index2 !== void 0) {
          deleted = true;
          if (this.size === 1) {
            this.clear();
          } else {
            this.removeItemSize(index2);
            const v = this.valList[index2];
            if (this.isBackgroundFetch(v)) {
              v.__abortController.abort(new Error("deleted"));
            } else {
              this.dispose(v, k, "delete");
              if (this.disposeAfter) {
                this.disposed.push([v, k, "delete"]);
              }
            }
            this.keyMap.delete(k);
            this.keyList[index2] = null;
            this.valList[index2] = null;
            if (index2 === this.tail) {
              this.tail = this.prev[index2];
            } else if (index2 === this.head) {
              this.head = this.next[index2];
            } else {
              this.next[this.prev[index2]] = this.next[index2];
              this.prev[this.next[index2]] = this.prev[index2];
            }
            this.size--;
            this.free.push(index2);
          }
        }
      }
      if (this.disposed) {
        while (this.disposed.length) {
          this.disposeAfter(...this.disposed.shift());
        }
      }
      return deleted;
    }
    clear() {
      for (const index2 of this.rindexes({ allowStale: true })) {
        const v = this.valList[index2];
        if (this.isBackgroundFetch(v)) {
          v.__abortController.abort(new Error("deleted"));
        } else {
          const k = this.keyList[index2];
          this.dispose(v, k, "delete");
          if (this.disposeAfter) {
            this.disposed.push([v, k, "delete"]);
          }
        }
      }
      this.keyMap.clear();
      this.valList.fill(null);
      this.keyList.fill(null);
      if (this.ttls) {
        this.ttls.fill(0);
        this.starts.fill(0);
      }
      if (this.sizes) {
        this.sizes.fill(0);
      }
      this.head = 0;
      this.tail = 0;
      this.initialFill = 1;
      this.free.length = 0;
      this.calculatedSize = 0;
      this.size = 0;
      if (this.disposed) {
        while (this.disposed.length) {
          this.disposeAfter(...this.disposed.shift());
        }
      }
    }
    get reset() {
      deprecatedMethod("reset", "clear");
      return this.clear;
    }
    get length() {
      deprecatedProperty("length", "size");
      return this.size;
    }
    static get AbortController() {
      return AC;
    }
    static get AbortSignal() {
      return AS;
    }
  }
  lruCache = LRUCache;
  return lruCache;
}
var hasRequiredNamedPlaceholders;
function requireNamedPlaceholders() {
  if (hasRequiredNamedPlaceholders) return namedPlaceholders.exports;
  hasRequiredNamedPlaceholders = 1;
  const RE_PARAM = /(?:\?)|(?::(\d+|(?:[a-zA-Z][a-zA-Z0-9_]*)))/g, DQUOTE = 34, SQUOTE = 39, BSLASH = 92;
  function parse(query2) {
    let ppos = RE_PARAM.exec(query2);
    let curpos = 0;
    let start = 0;
    let end;
    const parts = [];
    let inQuote = false;
    let escape = false;
    let qchr;
    const tokens = [];
    let qcnt = 0;
    let lastTokenEndPos = 0;
    let i;
    if (ppos) {
      do {
        for (i = curpos, end = ppos.index; i < end; ++i) {
          let chr = query2.charCodeAt(i);
          if (chr === BSLASH)
            escape = !escape;
          else {
            if (escape) {
              escape = false;
              continue;
            }
            if (inQuote && chr === qchr) {
              if (query2.charCodeAt(i + 1) === qchr) {
                ++i;
                continue;
              }
              inQuote = false;
            } else if (chr === DQUOTE || chr === SQUOTE) {
              inQuote = true;
              qchr = chr;
            }
          }
        }
        if (!inQuote) {
          parts.push(query2.substring(start, end));
          tokens.push(ppos[0].length === 1 ? qcnt++ : ppos[1]);
          start = end + ppos[0].length;
          lastTokenEndPos = start;
        }
        curpos = end + ppos[0].length;
      } while (ppos = RE_PARAM.exec(query2));
      if (tokens.length) {
        if (curpos < query2.length) {
          parts.push(query2.substring(lastTokenEndPos));
        }
        return [parts, tokens];
      }
    }
    return [query2];
  }
  function createCompiler(config) {
    if (!config)
      config = {};
    if (!config.placeholder) {
      config.placeholder = "?";
    }
    let ncache = 100;
    let cache;
    if (typeof config.cache === "number") {
      ncache = config.cache;
    }
    if (typeof config.cache === "object") {
      cache = config.cache;
    }
    if (config.cache !== false && !cache) {
      cache = new (requireLruCache())({ max: ncache });
    }
    function toArrayParams(tree, params) {
      const arr = [];
      if (tree.length == 1) {
        return [tree[0], []];
      }
      if (typeof params == "undefined")
        throw new Error("Named query contains placeholders, but parameters object is undefined");
      const tokens = tree[1];
      for (let i = 0; i < tokens.length; ++i) {
        arr.push(params[tokens[i]]);
      }
      return [tree[0], arr];
    }
    function noTailingSemicolon(s) {
      if (s.slice(-1) == ":") {
        return s.slice(0, -1);
      }
      return s;
    }
    function join(tree) {
      if (tree.length == 1) {
        return tree;
      }
      let unnamed = noTailingSemicolon(tree[0][0]);
      for (let i = 1; i < tree[0].length; ++i) {
        if (tree[0][i - 1].slice(-1) == ":") {
          unnamed += config.placeholder;
        }
        unnamed += config.placeholder;
        unnamed += noTailingSemicolon(tree[0][i]);
      }
      const last = tree[0][tree[0].length - 1];
      if (tree[0].length == tree[1].length) {
        if (last.slice(-1) == ":") {
          unnamed += config.placeholder;
        }
        unnamed += config.placeholder;
      }
      return [unnamed, tree[1]];
    }
    function compile2(query2, paramsObj) {
      let tree;
      if (cache && (tree = cache.get(query2))) {
        return toArrayParams(tree, paramsObj);
      }
      tree = join(parse(query2));
      if (cache) {
        cache.set(query2, tree);
      }
      return toArrayParams(tree, paramsObj);
    }
    compile2.parse = parse;
    return compile2;
  }
  function toNumbered(q, params) {
    const tree = parse(q);
    const paramsArr = [];
    if (tree.length == 1) {
      return [tree[0], paramsArr];
    }
    const pIndexes = {};
    let pLastIndex = 0;
    let qs = "";
    let varIndex;
    const varNames = [];
    for (let i = 0; i < tree[0].length; ++i) {
      varIndex = pIndexes[tree[1][i]];
      if (!varIndex) {
        varIndex = ++pLastIndex;
        pIndexes[tree[1][i]] = varIndex;
      }
      if (tree[1][i]) {
        varNames[varIndex - 1] = tree[1][i];
        qs += tree[0][i] + "$" + varIndex;
      } else {
        qs += tree[0][i];
      }
    }
    return [qs, varNames.map((n) => params[n])];
  }
  namedPlaceholders.exports = createCompiler;
  namedPlaceholders.exports.toNumbered = toNumbered;
  return namedPlaceholders.exports;
}
const Net = require$$0$7;
const Tls = require$$1$1;
const Timers = require$$1;
const EventEmitter$2 = require$$0$4.EventEmitter;
const Readable = require$$0$6.Readable;
const Queue$1 = denque;
const SqlString$1 = sqlstring;
const { createLRU } = lib;
const PacketParser2 = packet_parser;
const Packets = packetsExports;
const Commands = commands;
const ConnectionConfig$2 = connection_config;
const CharsetToEncoding = requireCharset_encodings();
let _connectionId = 0;
let convertNamedPlaceholders = null;
let BaseConnection$3 = class BaseConnection extends EventEmitter$2 {
  constructor(opts) {
    super();
    this.config = opts.config;
    if (!opts.config.stream) {
      if (opts.config.socketPath) {
        this.stream = Net.connect(opts.config.socketPath);
      } else {
        this.stream = Net.connect(opts.config.port, opts.config.host);
        if (this.config.enableKeepAlive) {
          this.stream.on("connect", () => {
            this.stream.setKeepAlive(true, this.config.keepAliveInitialDelay);
          });
        }
        this.stream.setNoDelay(true);
      }
    } else if (typeof opts.config.stream === "function") {
      this.stream = opts.config.stream(opts);
    } else {
      this.stream = opts.config.stream;
    }
    this._internalId = _connectionId++;
    this._commands = new Queue$1();
    this._command = null;
    this._paused = false;
    this._paused_packets = new Queue$1();
    this._statements = createLRU({
      max: this.config.maxPreparedStatements,
      onEviction: function(_, statement) {
        statement.close();
      }
    });
    this.serverCapabilityFlags = 0;
    this.authorized = false;
    this.sequenceId = 0;
    this.compressedSequenceId = 0;
    this.threadId = null;
    this._handshakePacket = null;
    this._fatalError = null;
    this._protocolError = null;
    this._outOfOrderPackets = [];
    this.clientEncoding = CharsetToEncoding[this.config.charsetNumber];
    this.stream.on("error", this._handleNetworkError.bind(this));
    this.packetParser = new PacketParser2((p) => {
      this.handlePacket(p);
    });
    this.stream.on("data", (data) => {
      if (this.connectTimeout) {
        Timers.clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }
      this.packetParser.execute(data);
    });
    this.stream.on("end", () => {
      this.emit("end");
    });
    this.stream.on("close", () => {
      if (this._closing) {
        return;
      }
      if (!this._protocolError) {
        this._protocolError = new Error(
          "Connection lost: The server closed the connection."
        );
        this._protocolError.fatal = true;
        this._protocolError.code = "PROTOCOL_CONNECTION_LOST";
      }
      this._notifyError(this._protocolError);
    });
    let handshakeCommand;
    if (!this.config.isServer) {
      handshakeCommand = new Commands.ClientHandshake(this.config.clientFlags);
      handshakeCommand.on("end", () => {
        if (!handshakeCommand.handshake || this._fatalError || this._protocolError) {
          return;
        }
        this._handshakePacket = handshakeCommand.handshake;
        this.threadId = handshakeCommand.handshake.connectionId;
        this.emit("connect", handshakeCommand.handshake);
      });
      handshakeCommand.on("error", (err) => {
        this._closing = true;
        this._notifyError(err);
      });
      this.addCommand(handshakeCommand);
    }
    this.serverEncoding = "utf8";
    if (this.config.connectTimeout) {
      const timeoutHandler = this._handleTimeoutError.bind(this);
      this.connectTimeout = Timers.setTimeout(
        timeoutHandler,
        this.config.connectTimeout
      );
    }
  }
  _addCommandClosedState(cmd) {
    const err = new Error(
      "Can't add new command when connection is in closed state"
    );
    err.fatal = true;
    if (cmd.onResult) {
      cmd.onResult(err);
    } else {
      this.emit("error", err);
    }
  }
  _handleFatalError(err) {
    err.fatal = true;
    this.stream.removeAllListeners("data");
    this.addCommand = this._addCommandClosedState;
    this.write = () => {
      this.emit("error", new Error("Can't write in closed state"));
    };
    this._notifyError(err);
    this._fatalError = err;
  }
  _handleNetworkError(err) {
    if (this.connectTimeout) {
      Timers.clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
    if (err.code === "ECONNRESET" && this._closing) {
      return;
    }
    this._handleFatalError(err);
  }
  _handleTimeoutError() {
    if (this.connectTimeout) {
      Timers.clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
    this.stream.destroy && this.stream.destroy();
    const err = new Error("connect ETIMEDOUT");
    err.errorno = "ETIMEDOUT";
    err.code = "ETIMEDOUT";
    err.syscall = "connect";
    this._handleNetworkError(err);
  }
  // notify all commands in the queue and bubble error as connection "error"
  // called on stream error or unexpected termination
  _notifyError(err) {
    if (this.connectTimeout) {
      Timers.clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
    if (this._fatalError) {
      return;
    }
    let command2;
    let bubbleErrorToConnection = !this._command;
    if (this._command && this._command.onResult) {
      this._command.onResult(err);
      this._command = null;
    } else if (!(this._command && this._command.constructor === Commands.ClientHandshake && this._commands.length > 0)) {
      bubbleErrorToConnection = true;
    }
    while (command2 = this._commands.shift()) {
      if (command2.onResult) {
        command2.onResult(err);
      } else {
        bubbleErrorToConnection = true;
      }
    }
    if (bubbleErrorToConnection || this._pool) {
      this.emit("error", err);
    }
    if (err.fatal) {
      this.close();
    }
  }
  write(buffer) {
    const result = this.stream.write(buffer, (err) => {
      if (err) {
        this._handleNetworkError(err);
      }
    });
    if (!result) {
      this.stream.emit("pause");
    }
  }
  // http://dev.mysql.com/doc/internals/en/sequence-id.html
  //
  // The sequence-id is incremented with each packet and may wrap around.
  // It starts at 0 and is reset to 0 when a new command
  // begins in the Command Phase.
  // http://dev.mysql.com/doc/internals/en/example-several-mysql-packets.html
  _resetSequenceId() {
    this.sequenceId = 0;
    this.compressedSequenceId = 0;
  }
  _bumpCompressedSequenceId(numPackets) {
    this.compressedSequenceId += numPackets;
    this.compressedSequenceId %= 256;
  }
  _bumpSequenceId(numPackets) {
    this.sequenceId += numPackets;
    this.sequenceId %= 256;
  }
  writePacket(packet2) {
    const MAX_PACKET_LENGTH2 = 16777215;
    const length2 = packet2.length();
    let chunk, offset, header;
    if (length2 < MAX_PACKET_LENGTH2) {
      packet2.writeHeader(this.sequenceId);
      if (this.config.debug) {
        console.log(
          `${this._internalId} ${this.connectionId} <== ${this._command._commandName}#${this._command.stateName()}(${[this.sequenceId, packet2._name, packet2.length()].join(",")})`
        );
        console.log(
          `${this._internalId} ${this.connectionId} <== ${packet2.buffer.toString("hex")}`
        );
      }
      this._bumpSequenceId(1);
      this.write(packet2.buffer);
    } else {
      if (this.config.debug) {
        console.log(
          `${this._internalId} ${this.connectionId} <== Writing large packet, raw content not written:`
        );
        console.log(
          `${this._internalId} ${this.connectionId} <== ${this._command._commandName}#${this._command.stateName()}(${[this.sequenceId, packet2._name, packet2.length()].join(",")})`
        );
      }
      for (offset = 4; offset < 4 + length2; offset += MAX_PACKET_LENGTH2) {
        chunk = packet2.buffer.slice(offset, offset + MAX_PACKET_LENGTH2);
        if (chunk.length === MAX_PACKET_LENGTH2) {
          header = Buffer.from([255, 255, 255, this.sequenceId]);
        } else {
          header = Buffer.from([
            chunk.length & 255,
            chunk.length >> 8 & 255,
            chunk.length >> 16 & 255,
            this.sequenceId
          ]);
        }
        this._bumpSequenceId(1);
        this.write(header);
        this.write(chunk);
      }
    }
  }
  // 0.11+ environment
  startTLS(onSecure) {
    if (this.config.debug) {
      console.log("Upgrading connection to TLS");
    }
    const secureContext = Tls.createSecureContext({
      ca: this.config.ssl.ca,
      cert: this.config.ssl.cert,
      ciphers: this.config.ssl.ciphers,
      key: this.config.ssl.key,
      passphrase: this.config.ssl.passphrase,
      minVersion: this.config.ssl.minVersion,
      maxVersion: this.config.ssl.maxVersion
    });
    const rejectUnauthorized = this.config.ssl.rejectUnauthorized;
    const verifyIdentity = this.config.ssl.verifyIdentity;
    const servername = this.config.host;
    let secureEstablished = false;
    this.stream.removeAllListeners("data");
    const secureSocket = Tls.connect(
      {
        rejectUnauthorized,
        requestCert: rejectUnauthorized,
        checkServerIdentity: verifyIdentity ? Tls.checkServerIdentity : function() {
          return void 0;
        },
        secureContext,
        isServer: false,
        socket: this.stream,
        servername
      },
      () => {
        secureEstablished = true;
        if (rejectUnauthorized) {
          if (typeof servername === "string" && verifyIdentity) {
            const cert = secureSocket.getPeerCertificate(true);
            const serverIdentityCheckError = Tls.checkServerIdentity(
              servername,
              cert
            );
            if (serverIdentityCheckError) {
              onSecure(serverIdentityCheckError);
              return;
            }
          }
        }
        onSecure();
      }
    );
    secureSocket.on("error", (err) => {
      if (secureEstablished) {
        this._handleNetworkError(err);
      } else {
        onSecure(err);
      }
    });
    secureSocket.on("data", (data) => {
      this.packetParser.execute(data);
    });
    this.write = (buffer) => secureSocket.write(buffer);
  }
  protocolError(message, code) {
    if (this._closing) {
      return;
    }
    const err = new Error(message);
    err.fatal = true;
    err.code = code || "PROTOCOL_ERROR";
    this.emit("error", err);
  }
  get fatalError() {
    return this._fatalError;
  }
  handlePacket(packet2) {
    if (this._paused) {
      this._paused_packets.push(packet2);
      return;
    }
    if (this.config.debug) {
      if (packet2) {
        console.log(
          ` raw: ${packet2.buffer.slice(packet2.offset, packet2.offset + packet2.length()).toString("hex")}`
        );
        console.trace();
        const commandName = this._command ? this._command._commandName : "(no command)";
        const stateName = this._command ? this._command.stateName() : "(no command)";
        console.log(
          `${this._internalId} ${this.connectionId} ==> ${commandName}#${stateName}(${[packet2.sequenceId, packet2.type(), packet2.length()].join(",")})`
        );
      }
    }
    if (!this._command) {
      const marker = packet2.peekByte();
      if (marker === 255) {
        const error = Packets.Error.fromPacket(packet2);
        this.protocolError(error.message, error.code);
      } else {
        this.protocolError(
          "Unexpected packet while no commands in the queue",
          "PROTOCOL_UNEXPECTED_PACKET"
        );
      }
      this.close();
      return;
    }
    if (packet2) {
      if (this.sequenceId !== packet2.sequenceId) {
        const err = new Error(
          `Warning: got packets out of order. Expected ${this.sequenceId} but received ${packet2.sequenceId}`
        );
        err.expected = this.sequenceId;
        err.received = packet2.sequenceId;
        this.emit("warn", err);
        console.error(err.message);
      }
      this._bumpSequenceId(packet2.numPackets);
    }
    try {
      if (this._fatalError) {
        return;
      }
      const done = this._command.execute(packet2, this);
      if (done) {
        this._command = this._commands.shift();
        if (this._command) {
          this.sequenceId = 0;
          this.compressedSequenceId = 0;
          this.handlePacket();
        }
      }
    } catch (err) {
      this._handleFatalError(err);
      this.stream.destroy();
    }
  }
  addCommand(cmd) {
    if (this.config.debug) {
      const commandName = cmd.constructor.name;
      console.log(`Add command: ${commandName}`);
      cmd._commandName = commandName;
    }
    if (!this._command) {
      this._command = cmd;
      this.handlePacket();
    } else {
      this._commands.push(cmd);
    }
    return cmd;
  }
  format(sql, values) {
    if (typeof this.config.queryFormat === "function") {
      return this.config.queryFormat.call(
        this,
        sql,
        values,
        this.config.timezone
      );
    }
    const opts = {
      sql,
      values
    };
    this._resolveNamedPlaceholders(opts);
    return SqlString$1.format(
      opts.sql,
      opts.values,
      this.config.stringifyObjects,
      this.config.timezone
    );
  }
  escape(value) {
    return SqlString$1.escape(value, false, this.config.timezone);
  }
  escapeId(value) {
    return SqlString$1.escapeId(value, false);
  }
  raw(sql) {
    return SqlString$1.raw(sql);
  }
  _resolveNamedPlaceholders(options) {
    let unnamed;
    if (this.config.namedPlaceholders || options.namedPlaceholders) {
      if (Array.isArray(options.values)) {
        return;
      }
      if (convertNamedPlaceholders === null) {
        convertNamedPlaceholders = requireNamedPlaceholders()();
      }
      unnamed = convertNamedPlaceholders(options.sql, options.values);
      options.sql = unnamed[0];
      options.values = unnamed[1];
    }
  }
  query(sql, values, cb) {
    let cmdQuery;
    if (sql.constructor === Commands.Query) {
      cmdQuery = sql;
    } else {
      cmdQuery = BaseConnection.createQuery(sql, values, cb, this.config);
    }
    this._resolveNamedPlaceholders(cmdQuery);
    const rawSql = this.format(
      cmdQuery.sql,
      cmdQuery.values !== void 0 ? cmdQuery.values : []
    );
    cmdQuery.sql = rawSql;
    return this.addCommand(cmdQuery);
  }
  pause() {
    this._paused = true;
    this.stream.pause();
  }
  resume() {
    let packet2;
    this._paused = false;
    while (packet2 = this._paused_packets.shift()) {
      this.handlePacket(packet2);
      if (this._paused) {
        return;
      }
    }
    this.stream.resume();
  }
  // TODO: named placeholders support
  prepare(options, cb) {
    if (typeof options === "string") {
      options = { sql: options };
    }
    return this.addCommand(new Commands.Prepare(options, cb));
  }
  unprepare(sql) {
    let options = {};
    if (typeof sql === "object") {
      options = sql;
    } else {
      options.sql = sql;
    }
    const key = BaseConnection.statementKey(options);
    const stmt = this._statements.get(key);
    if (stmt) {
      this._statements.delete(key);
      stmt.close();
    }
    return stmt;
  }
  execute(sql, values, cb) {
    let options = {
      infileStreamFactory: this.config.infileStreamFactory
    };
    if (typeof sql === "object") {
      options = {
        ...options,
        ...sql,
        sql: sql.sql,
        values: sql.values
      };
      if (typeof values === "function") {
        cb = values;
      } else {
        options.values = options.values || values;
      }
    } else if (typeof values === "function") {
      cb = values;
      options.sql = sql;
      options.values = void 0;
    } else {
      options.sql = sql;
      options.values = values;
    }
    this._resolveNamedPlaceholders(options);
    if (options.values) {
      if (!Array.isArray(options.values)) {
        throw new TypeError(
          "Bind parameters must be array if namedPlaceholders parameter is not enabled"
        );
      }
      options.values.forEach((val) => {
        if (!Array.isArray(options.values)) {
          throw new TypeError(
            "Bind parameters must be array if namedPlaceholders parameter is not enabled"
          );
        }
        if (val === void 0) {
          throw new TypeError(
            "Bind parameters must not contain undefined. To pass SQL NULL specify JS null"
          );
        }
        if (typeof val === "function") {
          throw new TypeError(
            "Bind parameters must not contain function(s). To pass the body of a function as a string call .toString() first"
          );
        }
      });
    }
    const executeCommand = new Commands.Execute(options, cb);
    const prepareCommand = new Commands.Prepare(options, (err, stmt) => {
      if (err) {
        executeCommand.start = function() {
          return null;
        };
        if (cb) {
          cb(err);
        } else {
          executeCommand.emit("error", err);
        }
        executeCommand.emit("end");
        return;
      }
      executeCommand.statement = stmt;
    });
    this.addCommand(prepareCommand);
    this.addCommand(executeCommand);
    return executeCommand;
  }
  changeUser(options, callback) {
    if (!callback && typeof options === "function") {
      callback = options;
      options = {};
    }
    const charsetNumber = options.charset ? ConnectionConfig$2.getCharsetNumber(options.charset) : this.config.charsetNumber;
    return this.addCommand(
      new Commands.ChangeUser(
        {
          user: options.user || this.config.user,
          // for the purpose of multi-factor authentication, or not, the main
          // password (used for the 1st authentication factor) can also be
          // provided via the "password1" option
          password: options.password || options.password1 || this.config.password || this.config.password1,
          password2: options.password2 || this.config.password2,
          password3: options.password3 || this.config.password3,
          passwordSha1: options.passwordSha1 || this.config.passwordSha1,
          database: options.database || this.config.database,
          timeout: options.timeout,
          charsetNumber,
          currentConfig: this.config
        },
        (err) => {
          if (err) {
            err.fatal = true;
          }
          if (callback) {
            callback(err);
          }
        }
      )
    );
  }
  // transaction helpers
  beginTransaction(cb) {
    return this.query("START TRANSACTION", cb);
  }
  commit(cb) {
    return this.query("COMMIT", cb);
  }
  rollback(cb) {
    return this.query("ROLLBACK", cb);
  }
  ping(cb) {
    return this.addCommand(new Commands.Ping(cb));
  }
  _registerSlave(opts, cb) {
    return this.addCommand(new Commands.RegisterSlave(opts, cb));
  }
  _binlogDump(opts, cb) {
    return this.addCommand(new Commands.BinlogDump(opts, cb));
  }
  // currently just alias to close
  destroy() {
    this.close();
  }
  close() {
    if (this.connectTimeout) {
      Timers.clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }
    this._closing = true;
    this.stream.end();
    this.addCommand = this._addCommandClosedState;
  }
  createBinlogStream(opts) {
    let test = 1;
    const stream = new Readable({ objectMode: true });
    stream._read = function() {
      return {
        data: test++
      };
    };
    this._registerSlave(opts, () => {
      const dumpCmd = this._binlogDump(opts);
      dumpCmd.on("event", (ev) => {
        stream.push(ev);
      });
      dumpCmd.on("eof", () => {
        stream.push(null);
        if (opts.flags && opts.flags & 1) {
          this.close();
        }
      });
    });
    return stream;
  }
  connect(cb) {
    if (!cb) {
      return;
    }
    if (this._fatalError || this._protocolError) {
      return cb(this._fatalError || this._protocolError);
    }
    if (this._handshakePacket) {
      return cb(null, this);
    }
    let connectCalled = 0;
    function callbackOnce(isErrorHandler) {
      return function(param) {
        if (!connectCalled) {
          if (isErrorHandler) {
            cb(param);
          } else {
            cb(null, param);
          }
        }
        connectCalled = 1;
      };
    }
    this.once("error", callbackOnce(true));
    this.once("connect", callbackOnce(false));
  }
  // ===================================
  // outgoing server connection methods
  // ===================================
  writeColumns(columns) {
    this.writePacket(Packets.ResultSetHeader.toPacket(columns.length));
    columns.forEach((column) => {
      this.writePacket(
        Packets.ColumnDefinition.toPacket(column, this.serverConfig.encoding)
      );
    });
    this.writeEof();
  }
  // row is array of columns, not hash
  writeTextRow(column) {
    this.writePacket(
      Packets.TextRow.toPacket(column, this.serverConfig.encoding)
    );
  }
  writeBinaryRow(column) {
    this.writePacket(
      Packets.BinaryRow.toPacket(column, this.serverConfig.encoding)
    );
  }
  writeTextResult(rows, columns, binary = false) {
    this.writeColumns(columns);
    rows.forEach((row) => {
      const arrayRow = new Array(columns.length);
      columns.forEach((column) => {
        arrayRow.push(row[column.name]);
      });
      if (binary) {
        this.writeBinaryRow(arrayRow);
      } else this.writeTextRow(arrayRow);
    });
    this.writeEof();
  }
  writeEof(warnings, statusFlags) {
    this.writePacket(Packets.EOF.toPacket(warnings, statusFlags));
  }
  writeOk(args) {
    if (!args) {
      args = { affectedRows: 0 };
    }
    this.writePacket(Packets.OK.toPacket(args, this.serverConfig.encoding));
  }
  writeError(args) {
    const encoding = this.serverConfig ? this.serverConfig.encoding : "cesu8";
    this.writePacket(Packets.Error.toPacket(args, encoding));
  }
  serverHandshake(args) {
    this.serverConfig = args;
    this.serverConfig.encoding = CharsetToEncoding[this.serverConfig.characterSet];
    return this.addCommand(new Commands.ServerHandshake(args));
  }
  // ===============================================================
  end(callback) {
    if (this.config.isServer) {
      this._closing = true;
      const quitCmd2 = new EventEmitter$2();
      setImmediate(() => {
        this.stream.end();
        quitCmd2.emit("end");
      });
      return quitCmd2;
    }
    const quitCmd = this.addCommand(new Commands.Quit(callback));
    this.addCommand = this._addCommandClosedState;
    return quitCmd;
  }
  static createQuery(sql, values, cb, config) {
    let options = {
      rowsAsArray: config.rowsAsArray,
      infileStreamFactory: config.infileStreamFactory
    };
    if (typeof sql === "object") {
      options = {
        ...options,
        ...sql,
        sql: sql.sql,
        values: sql.values
      };
      if (typeof values === "function") {
        cb = values;
      } else if (values !== void 0) {
        options.values = values;
      }
    } else if (typeof values === "function") {
      cb = values;
      options.sql = sql;
      options.values = void 0;
    } else {
      options.sql = sql;
      options.values = values;
    }
    return new Commands.Query(options, cb);
  }
  static statementKey(options) {
    return `${typeof options.nestTables}/${options.nestTables}/${options.rowsAsArray}${options.sql}`;
  }
};
var connection$2 = BaseConnection$3;
var make_done_cb;
var hasRequiredMake_done_cb;
function requireMake_done_cb() {
  if (hasRequiredMake_done_cb) return make_done_cb;
  hasRequiredMake_done_cb = 1;
  function makeDoneCb(resolve, reject, localErr) {
    return function(err, rows, fields2) {
      if (err) {
        localErr.message = err.message;
        localErr.code = err.code;
        localErr.errno = err.errno;
        localErr.sql = err.sql;
        localErr.sqlState = err.sqlState;
        localErr.sqlMessage = err.sqlMessage;
        reject(localErr);
      } else {
        resolve([rows, fields2]);
      }
    };
  }
  make_done_cb = makeDoneCb;
  return make_done_cb;
}
var prepared_statement_info;
var hasRequiredPrepared_statement_info;
function requirePrepared_statement_info() {
  if (hasRequiredPrepared_statement_info) return prepared_statement_info;
  hasRequiredPrepared_statement_info = 1;
  const makeDoneCb = requireMake_done_cb();
  class PromisePreparedStatementInfo {
    constructor(statement, promiseImpl) {
      this.statement = statement;
      this.Promise = promiseImpl;
    }
    execute(parameters) {
      const s = this.statement;
      const localErr = new Error();
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        if (parameters) {
          s.execute(parameters, done);
        } else {
          s.execute(done);
        }
      });
    }
    close() {
      return new this.Promise((resolve) => {
        this.statement.close();
        resolve();
      });
    }
  }
  prepared_statement_info = PromisePreparedStatementInfo;
  return prepared_statement_info;
}
var inherit_events;
var hasRequiredInherit_events;
function requireInherit_events() {
  if (hasRequiredInherit_events) return inherit_events;
  hasRequiredInherit_events = 1;
  function inheritEvents(source, target, events) {
    const listeners = {};
    target.on("newListener", (eventName) => {
      if (events.indexOf(eventName) >= 0 && !target.listenerCount(eventName)) {
        source.on(
          eventName,
          listeners[eventName] = function() {
            const args = [].slice.call(arguments);
            args.unshift(eventName);
            target.emit.apply(target, args);
          }
        );
      }
    }).on("removeListener", (eventName) => {
      if (events.indexOf(eventName) >= 0 && !target.listenerCount(eventName)) {
        source.removeListener(eventName, listeners[eventName]);
        delete listeners[eventName];
      }
    });
  }
  inherit_events = inheritEvents;
  return inherit_events;
}
var connection$1;
var hasRequiredConnection;
function requireConnection() {
  if (hasRequiredConnection) return connection$1;
  hasRequiredConnection = 1;
  const EventEmitter2 = require$$0$4.EventEmitter;
  const PromisePreparedStatementInfo = requirePrepared_statement_info();
  const makeDoneCb = requireMake_done_cb();
  const inheritEvents = requireInherit_events();
  const BaseConnection3 = connection$2;
  class PromiseConnection extends EventEmitter2 {
    constructor(connection2, promiseImpl) {
      super();
      this.connection = connection2;
      this.Promise = promiseImpl || Promise;
      inheritEvents(connection2, this, [
        "error",
        "drain",
        "connect",
        "end",
        "enqueue"
      ]);
    }
    release() {
      this.connection.release();
    }
    query(query2, params) {
      const c = this.connection;
      const localErr = new Error();
      if (typeof params === "function") {
        throw new Error(
          "Callback function is not available with promise clients."
        );
      }
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        if (params !== void 0) {
          c.query(query2, params, done);
        } else {
          c.query(query2, done);
        }
      });
    }
    execute(query2, params) {
      const c = this.connection;
      const localErr = new Error();
      if (typeof params === "function") {
        throw new Error(
          "Callback function is not available with promise clients."
        );
      }
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        if (params !== void 0) {
          c.execute(query2, params, done);
        } else {
          c.execute(query2, done);
        }
      });
    }
    end() {
      return new this.Promise((resolve) => {
        this.connection.end(resolve);
      });
    }
    beginTransaction() {
      const c = this.connection;
      const localErr = new Error();
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        c.beginTransaction(done);
      });
    }
    commit() {
      const c = this.connection;
      const localErr = new Error();
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        c.commit(done);
      });
    }
    rollback() {
      const c = this.connection;
      const localErr = new Error();
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        c.rollback(done);
      });
    }
    ping() {
      const c = this.connection;
      const localErr = new Error();
      return new this.Promise((resolve, reject) => {
        c.ping((err) => {
          if (err) {
            localErr.message = err.message;
            localErr.code = err.code;
            localErr.errno = err.errno;
            localErr.sqlState = err.sqlState;
            localErr.sqlMessage = err.sqlMessage;
            reject(localErr);
          } else {
            resolve(true);
          }
        });
      });
    }
    connect() {
      const c = this.connection;
      const localErr = new Error();
      return new this.Promise((resolve, reject) => {
        c.connect((err, param) => {
          if (err) {
            localErr.message = err.message;
            localErr.code = err.code;
            localErr.errno = err.errno;
            localErr.sqlState = err.sqlState;
            localErr.sqlMessage = err.sqlMessage;
            reject(localErr);
          } else {
            resolve(param);
          }
        });
      });
    }
    prepare(options) {
      const c = this.connection;
      const promiseImpl = this.Promise;
      const localErr = new Error();
      return new this.Promise((resolve, reject) => {
        c.prepare(options, (err, statement) => {
          if (err) {
            localErr.message = err.message;
            localErr.code = err.code;
            localErr.errno = err.errno;
            localErr.sqlState = err.sqlState;
            localErr.sqlMessage = err.sqlMessage;
            reject(localErr);
          } else {
            const wrappedStatement = new PromisePreparedStatementInfo(
              statement,
              promiseImpl
            );
            resolve(wrappedStatement);
          }
        });
      });
    }
    changeUser(options) {
      const c = this.connection;
      const localErr = new Error();
      return new this.Promise((resolve, reject) => {
        c.changeUser(options, (err) => {
          if (err) {
            localErr.message = err.message;
            localErr.code = err.code;
            localErr.errno = err.errno;
            localErr.sqlState = err.sqlState;
            localErr.sqlMessage = err.sqlMessage;
            reject(localErr);
          } else {
            resolve();
          }
        });
      });
    }
    get config() {
      return this.connection.config;
    }
    get threadId() {
      return this.connection.threadId;
    }
  }
  (function(functionsToWrap) {
    for (let i = 0; functionsToWrap && i < functionsToWrap.length; i++) {
      const func = functionsToWrap[i];
      if (typeof BaseConnection3.prototype[func] === "function" && PromiseConnection.prototype[func] === void 0) {
        PromiseConnection.prototype[func] = /* @__PURE__ */ function factory(funcName) {
          return function() {
            return BaseConnection3.prototype[funcName].apply(
              this.connection,
              arguments
            );
          };
        }(func);
      }
    }
  })([
    // synchronous functions
    "close",
    "createBinlogStream",
    "destroy",
    "escape",
    "escapeId",
    "format",
    "pause",
    "pipe",
    "resume",
    "unprepare"
  ]);
  connection$1 = PromiseConnection;
  return connection$1;
}
const BaseConnection$2 = connection$2;
let Connection$2 = class Connection extends BaseConnection$2 {
  promise(promiseImpl) {
    const PromiseConnection = requireConnection();
    return new PromiseConnection(this, promiseImpl);
  }
};
var connection = Connection$2;
const Connection$1 = connection;
const ConnectionConfig$1 = connection_config;
function createConnection(opts) {
  return new Connection$1({ config: new ConnectionConfig$1(opts) });
}
var create_connection = createConnection;
const BaseConnection$1 = connection$2;
let BasePoolConnection$1 = class BasePoolConnection extends BaseConnection$1 {
  constructor(pool2, options) {
    super(options);
    this._pool = pool2;
    this.lastActiveTime = Date.now();
    this.once("end", () => {
      this._removeFromPool();
    });
    this.once("error", () => {
      this._removeFromPool();
    });
  }
  release() {
    if (!this._pool || this._pool._closed) {
      return;
    }
    this.lastActiveTime = Date.now();
    this._pool.releaseConnection(this);
  }
  end() {
    const err = new Error(
      "Calling conn.end() to release a pooled connection is deprecated. In next version calling conn.end() will be restored to default conn.end() behavior. Use conn.release() instead."
    );
    this.emit("warn", err);
    console.warn(err.message);
    this.release();
  }
  destroy() {
    this._removeFromPool();
    super.destroy();
  }
  _removeFromPool() {
    if (!this._pool || this._pool._closed) {
      return;
    }
    const pool2 = this._pool;
    this._pool = null;
    pool2._removeConnection(this);
  }
};
BasePoolConnection$1.statementKey = BaseConnection$1.statementKey;
var pool_connection$2 = BasePoolConnection$1;
BasePoolConnection$1.prototype._realEnd = BaseConnection$1.prototype.end;
var pool_connection$1;
var hasRequiredPool_connection;
function requirePool_connection() {
  if (hasRequiredPool_connection) return pool_connection$1;
  hasRequiredPool_connection = 1;
  const PromiseConnection = requireConnection();
  const BasePoolConnection3 = pool_connection$2;
  class PromisePoolConnection extends PromiseConnection {
    constructor(connection2, promiseImpl) {
      super(connection2, promiseImpl);
    }
    destroy() {
      return BasePoolConnection3.prototype.destroy.apply(
        this.connection,
        arguments
      );
    }
  }
  pool_connection$1 = PromisePoolConnection;
  return pool_connection$1;
}
const BasePoolConnection2 = pool_connection$2;
let PoolConnection$1 = class PoolConnection extends BasePoolConnection2 {
  promise(promiseImpl) {
    const PromisePoolConnection = requirePool_connection();
    return new PromisePoolConnection(this, promiseImpl);
  }
};
var pool_connection = PoolConnection$1;
const process$2 = require$$0$3;
const SqlString = sqlstring;
const EventEmitter$1 = require$$0$4.EventEmitter;
const PoolConnection2 = pool_connection;
const Queue = denque;
const BaseConnection2 = connection$2;
function spliceConnection(queue, connection2) {
  const len = queue.length;
  for (let i = 0; i < len; i++) {
    if (queue.get(i) === connection2) {
      queue.removeOne(i);
      break;
    }
  }
}
let BasePool$1 = class BasePool extends EventEmitter$1 {
  constructor(options) {
    super();
    this.config = options.config;
    this.config.connectionConfig.pool = this;
    this._allConnections = new Queue();
    this._freeConnections = new Queue();
    this._connectionQueue = new Queue();
    this._closed = false;
    if (this.config.maxIdle < this.config.connectionLimit) {
      this._removeIdleTimeoutConnections();
    }
  }
  getConnection(cb) {
    if (this._closed) {
      return process$2.nextTick(() => cb(new Error("Pool is closed.")));
    }
    let connection2;
    if (this._freeConnections.length > 0) {
      connection2 = this._freeConnections.pop();
      this.emit("acquire", connection2);
      return process$2.nextTick(() => cb(null, connection2));
    }
    if (this.config.connectionLimit === 0 || this._allConnections.length < this.config.connectionLimit) {
      connection2 = new PoolConnection2(this, {
        config: this.config.connectionConfig
      });
      this._allConnections.push(connection2);
      return connection2.connect((err) => {
        if (this._closed) {
          return cb(new Error("Pool is closed."));
        }
        if (err) {
          return cb(err);
        }
        this.emit("connection", connection2);
        this.emit("acquire", connection2);
        return cb(null, connection2);
      });
    }
    if (!this.config.waitForConnections) {
      return process$2.nextTick(() => cb(new Error("No connections available.")));
    }
    if (this.config.queueLimit && this._connectionQueue.length >= this.config.queueLimit) {
      return cb(new Error("Queue limit reached."));
    }
    this.emit("enqueue");
    return this._connectionQueue.push(cb);
  }
  releaseConnection(connection2) {
    let cb;
    if (!connection2._pool) {
      if (this._connectionQueue.length) {
        cb = this._connectionQueue.shift();
        process$2.nextTick(this.getConnection.bind(this, cb));
      }
    } else if (this._connectionQueue.length) {
      cb = this._connectionQueue.shift();
      process$2.nextTick(cb.bind(null, null, connection2));
    } else {
      this._freeConnections.push(connection2);
      this.emit("release", connection2);
    }
  }
  end(cb) {
    this._closed = true;
    clearTimeout(this._removeIdleTimeoutConnectionsTimer);
    if (typeof cb !== "function") {
      cb = function(err) {
        if (err) {
          throw err;
        }
      };
    }
    let calledBack = false;
    let closedConnections = 0;
    let connection2;
    const endCB = (function(err) {
      if (calledBack) {
        return;
      }
      if (err || ++closedConnections >= this._allConnections.length) {
        calledBack = true;
        cb(err);
        return;
      }
    }).bind(this);
    if (this._allConnections.length === 0) {
      endCB();
      return;
    }
    for (let i = 0; i < this._allConnections.length; i++) {
      connection2 = this._allConnections.get(i);
      connection2._realEnd(endCB);
    }
  }
  query(sql, values, cb) {
    const cmdQuery = BaseConnection2.createQuery(
      sql,
      values,
      cb,
      this.config.connectionConfig
    );
    if (typeof cmdQuery.namedPlaceholders === "undefined") {
      cmdQuery.namedPlaceholders = this.config.connectionConfig.namedPlaceholders;
    }
    this.getConnection((err, conn) => {
      if (err) {
        if (typeof cmdQuery.onResult === "function") {
          cmdQuery.onResult(err);
        } else {
          cmdQuery.emit("error", err);
        }
        return;
      }
      try {
        conn.query(cmdQuery).once("end", () => {
          conn.release();
        });
      } catch (e) {
        conn.release();
        throw e;
      }
    });
    return cmdQuery;
  }
  execute(sql, values, cb) {
    if (typeof values === "function") {
      cb = values;
      values = [];
    }
    this.getConnection((err, conn) => {
      if (err) {
        return cb(err);
      }
      try {
        conn.execute(sql, values, cb).once("end", () => {
          conn.release();
        });
      } catch (e) {
        conn.release();
        return cb(e);
      }
    });
  }
  _removeConnection(connection2) {
    spliceConnection(this._allConnections, connection2);
    spliceConnection(this._freeConnections, connection2);
    this.releaseConnection(connection2);
  }
  _removeIdleTimeoutConnections() {
    if (this._removeIdleTimeoutConnectionsTimer) {
      clearTimeout(this._removeIdleTimeoutConnectionsTimer);
    }
    this._removeIdleTimeoutConnectionsTimer = setTimeout(() => {
      try {
        while (this._freeConnections.length > this.config.maxIdle || this._freeConnections.length > 0 && Date.now() - this._freeConnections.get(0).lastActiveTime > this.config.idleTimeout) {
          this._freeConnections.get(0).destroy();
        }
      } finally {
        this._removeIdleTimeoutConnections();
      }
    }, 1e3);
  }
  format(sql, values) {
    return SqlString.format(
      sql,
      values,
      this.config.connectionConfig.stringifyObjects,
      this.config.connectionConfig.timezone
    );
  }
  escape(value) {
    return SqlString.escape(
      value,
      this.config.connectionConfig.stringifyObjects,
      this.config.connectionConfig.timezone
    );
  }
  escapeId(value) {
    return SqlString.escapeId(value, false);
  }
};
var pool$2 = BasePool$1;
var pool$1;
var hasRequiredPool;
function requirePool() {
  if (hasRequiredPool) return pool$1;
  hasRequiredPool = 1;
  const EventEmitter2 = require$$0$4.EventEmitter;
  const makeDoneCb = requireMake_done_cb();
  const PromisePoolConnection = requirePool_connection();
  const inheritEvents = requireInherit_events();
  const BasePool3 = pool$2;
  class PromisePool extends EventEmitter2 {
    constructor(pool2, thePromise) {
      super();
      this.pool = pool2;
      this.Promise = thePromise || Promise;
      inheritEvents(pool2, this, ["acquire", "connection", "enqueue", "release"]);
    }
    getConnection() {
      const corePool = this.pool;
      return new this.Promise((resolve, reject) => {
        corePool.getConnection((err, coreConnection) => {
          if (err) {
            reject(err);
          } else {
            resolve(new PromisePoolConnection(coreConnection, this.Promise));
          }
        });
      });
    }
    releaseConnection(connection2) {
      if (connection2 instanceof PromisePoolConnection) connection2.release();
    }
    query(sql, args) {
      const corePool = this.pool;
      const localErr = new Error();
      if (typeof args === "function") {
        throw new Error(
          "Callback function is not available with promise clients."
        );
      }
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        if (args !== void 0) {
          corePool.query(sql, args, done);
        } else {
          corePool.query(sql, done);
        }
      });
    }
    execute(sql, args) {
      const corePool = this.pool;
      const localErr = new Error();
      if (typeof args === "function") {
        throw new Error(
          "Callback function is not available with promise clients."
        );
      }
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        if (args) {
          corePool.execute(sql, args, done);
        } else {
          corePool.execute(sql, done);
        }
      });
    }
    end() {
      const corePool = this.pool;
      const localErr = new Error();
      return new this.Promise((resolve, reject) => {
        corePool.end((err) => {
          if (err) {
            localErr.message = err.message;
            localErr.code = err.code;
            localErr.errno = err.errno;
            localErr.sqlState = err.sqlState;
            localErr.sqlMessage = err.sqlMessage;
            reject(localErr);
          } else {
            resolve();
          }
        });
      });
    }
  }
  (function(functionsToWrap) {
    for (let i = 0; functionsToWrap && i < functionsToWrap.length; i++) {
      const func = functionsToWrap[i];
      if (typeof BasePool3.prototype[func] === "function" && PromisePool.prototype[func] === void 0) {
        PromisePool.prototype[func] = /* @__PURE__ */ function factory(funcName) {
          return function() {
            return BasePool3.prototype[funcName].apply(this.pool, arguments);
          };
        }(func);
      }
    }
  })([
    // synchronous functions
    "escape",
    "escapeId",
    "format"
  ]);
  pool$1 = PromisePool;
  return pool$1;
}
const BasePool2 = pool$2;
let Pool$2 = class Pool extends BasePool2 {
  promise(promiseImpl) {
    const PromisePool = requirePool();
    return new PromisePool(this, promiseImpl);
  }
};
var pool = Pool$2;
const ConnectionConfig2 = connection_config;
let PoolConfig$2 = class PoolConfig {
  constructor(options) {
    if (typeof options === "string") {
      options = ConnectionConfig2.parseUrl(options);
    }
    this.connectionConfig = new ConnectionConfig2(options);
    this.waitForConnections = options.waitForConnections === void 0 ? true : Boolean(options.waitForConnections);
    this.connectionLimit = isNaN(options.connectionLimit) ? 10 : Number(options.connectionLimit);
    this.maxIdle = isNaN(options.maxIdle) ? this.connectionLimit : Number(options.maxIdle);
    this.idleTimeout = isNaN(options.idleTimeout) ? 6e4 : Number(options.idleTimeout);
    this.queueLimit = isNaN(options.queueLimit) ? 0 : Number(options.queueLimit);
  }
};
var pool_config = PoolConfig$2;
const process$1 = require$$0$3;
const Pool$1 = pool;
const PoolConfig$1 = pool_config;
const Connection2 = connection;
const EventEmitter = require$$0$4.EventEmitter;
const makeSelector = {
  RR() {
    let index2 = 0;
    return (clusterIds) => clusterIds[index2++ % clusterIds.length];
  },
  RANDOM() {
    return (clusterIds) => clusterIds[Math.floor(Math.random() * clusterIds.length)];
  },
  ORDER() {
    return (clusterIds) => clusterIds[0];
  }
};
const getMonotonicMilliseconds = function() {
  let ms;
  if (typeof process$1.hrtime === "function") {
    ms = process$1.hrtime();
    ms = ms[0] * 1e3 + ms[1] * 1e-6;
  } else {
    ms = process$1.uptime() * 1e3;
  }
  return Math.floor(ms);
};
const patternRegExp = function(pattern) {
  if (pattern instanceof RegExp) {
    return pattern;
  }
  const source = pattern.replace(/([.+?^=!:${}()|[\]/\\])/g, "\\$1").replace(/\*/g, ".*");
  return new RegExp(`^${source}$`);
};
class PoolNamespace {
  constructor(cluster, pattern, selector) {
    this._cluster = cluster;
    this._pattern = pattern;
    this._selector = makeSelector[selector]();
  }
  getConnection(cb) {
    const clusterNode = this._getClusterNode();
    if (clusterNode === null) {
      let err = new Error("Pool does Not exist.");
      err.code = "POOL_NOEXIST";
      if (this._cluster._findNodeIds(this._pattern, true).length !== 0) {
        err = new Error("Pool does Not have online node.");
        err.code = "POOL_NONEONLINE";
      }
      return cb(err);
    }
    return this._cluster._getConnection(clusterNode, (err, connection2) => {
      if (err) {
        if (this._cluster._canRetry && this._cluster._findNodeIds(this._pattern).length !== 0) {
          this._cluster.emit("warn", err);
          return this.getConnection(cb);
        }
        return cb(err);
      }
      return cb(null, connection2);
    });
  }
  /**
   * pool cluster query
   * @param {*} sql
   * @param {*} values
   * @param {*} cb
   * @returns query
   */
  query(sql, values, cb) {
    const query2 = Connection2.createQuery(sql, values, cb, {});
    this.getConnection((err, conn) => {
      if (err) {
        if (typeof query2.onResult === "function") {
          query2.onResult(err);
        } else {
          query2.emit("error", err);
        }
        return;
      }
      try {
        conn.query(query2).once("end", () => {
          conn.release();
        });
      } catch (e) {
        conn.release();
        throw e;
      }
    });
    return query2;
  }
  /**
   * pool cluster execute
   * @param {*} sql
   * @param {*} values
   * @param {*} cb
   */
  execute(sql, values, cb) {
    if (typeof values === "function") {
      cb = values;
      values = [];
    }
    this.getConnection((err, conn) => {
      if (err) {
        return cb(err);
      }
      try {
        conn.execute(sql, values, cb).once("end", () => {
          conn.release();
        });
      } catch (e) {
        conn.release();
        throw e;
      }
    });
  }
  _getClusterNode() {
    const foundNodeIds = this._cluster._findNodeIds(this._pattern);
    if (foundNodeIds.length === 0) {
      return null;
    }
    const nodeId = foundNodeIds.length === 1 ? foundNodeIds[0] : this._selector(foundNodeIds);
    return this._cluster._getNode(nodeId);
  }
}
let PoolCluster$1 = class PoolCluster extends EventEmitter {
  constructor(config) {
    super();
    config = config || {};
    this._canRetry = typeof config.canRetry === "undefined" ? true : config.canRetry;
    this._removeNodeErrorCount = config.removeNodeErrorCount || 5;
    this._restoreNodeTimeout = config.restoreNodeTimeout || 0;
    this._defaultSelector = config.defaultSelector || "RR";
    this._closed = false;
    this._lastId = 0;
    this._nodes = {};
    this._serviceableNodeIds = [];
    this._namespaces = {};
    this._findCaches = {};
  }
  of(pattern, selector) {
    pattern = pattern || "*";
    selector = selector || this._defaultSelector;
    selector = selector.toUpperCase();
    if (!makeSelector[selector] === "undefined") {
      selector = this._defaultSelector;
    }
    const key = pattern + selector;
    if (typeof this._namespaces[key] === "undefined") {
      this._namespaces[key] = new PoolNamespace(this, pattern, selector);
    }
    return this._namespaces[key];
  }
  add(id, config) {
    if (typeof id === "object") {
      config = id;
      id = `CLUSTER::${++this._lastId}`;
    }
    if (typeof this._nodes[id] === "undefined") {
      this._nodes[id] = {
        id,
        errorCount: 0,
        pool: new Pool$1({ config: new PoolConfig$1(config) }),
        _offlineUntil: 0
      };
      this._serviceableNodeIds.push(id);
      this._clearFindCaches();
    }
  }
  remove(pattern) {
    const foundNodeIds = this._findNodeIds(pattern, true);
    for (let i = 0; i < foundNodeIds.length; i++) {
      const node = this._getNode(foundNodeIds[i]);
      if (node) {
        this._removeNode(node);
      }
    }
  }
  getConnection(pattern, selector, cb) {
    let namespace;
    if (typeof pattern === "function") {
      cb = pattern;
      namespace = this.of();
    } else {
      if (typeof selector === "function") {
        cb = selector;
        selector = this._defaultSelector;
      }
      namespace = this.of(pattern, selector);
    }
    namespace.getConnection(cb);
  }
  end(callback) {
    const cb = callback !== void 0 ? callback : (err) => {
      if (err) {
        throw err;
      }
    };
    if (this._closed) {
      process$1.nextTick(cb);
      return;
    }
    this._closed = true;
    let calledBack = false;
    let waitingClose = 0;
    const onEnd = (err) => {
      if (!calledBack && (err || --waitingClose <= 0)) {
        calledBack = true;
        return cb(err);
      }
    };
    for (const id in this._nodes) {
      waitingClose++;
      this._nodes[id].pool.end(onEnd);
    }
    if (waitingClose === 0) {
      process$1.nextTick(onEnd);
    }
  }
  _findNodeIds(pattern, includeOffline) {
    let currentTime = 0;
    let foundNodeIds = this._findCaches[pattern];
    if (foundNodeIds === void 0) {
      const expression = patternRegExp(pattern);
      foundNodeIds = this._serviceableNodeIds.filter(
        (id) => id.match(expression)
      );
    }
    this._findCaches[pattern] = foundNodeIds;
    if (includeOffline) {
      return foundNodeIds;
    }
    return foundNodeIds.filter((nodeId) => {
      const node = this._getNode(nodeId);
      if (!node._offlineUntil) {
        return true;
      }
      if (!currentTime) {
        currentTime = getMonotonicMilliseconds();
      }
      return node._offlineUntil <= currentTime;
    });
  }
  _getNode(id) {
    return this._nodes[id] || null;
  }
  _increaseErrorCount(node) {
    const errorCount = ++node.errorCount;
    if (this._removeNodeErrorCount > errorCount) {
      return;
    }
    if (this._restoreNodeTimeout > 0) {
      node._offlineUntil = getMonotonicMilliseconds() + this._restoreNodeTimeout;
      this.emit("offline", node.id);
      return;
    }
    this._removeNode(node);
    this.emit("remove", node.id);
  }
  _decreaseErrorCount(node) {
    let errorCount = node.errorCount;
    if (errorCount > this._removeNodeErrorCount) {
      errorCount = this._removeNodeErrorCount;
    }
    if (errorCount < 1) {
      errorCount = 1;
    }
    node.errorCount = errorCount - 1;
    if (node._offlineUntil) {
      node._offlineUntil = 0;
      this.emit("online", node.id);
    }
  }
  _getConnection(node, cb) {
    node.pool.getConnection((err, connection2) => {
      if (err) {
        this._increaseErrorCount(node);
        return cb(err);
      }
      this._decreaseErrorCount(node);
      connection2._clusterId = node.id;
      return cb(null, connection2);
    });
  }
  _removeNode(node) {
    const index2 = this._serviceableNodeIds.indexOf(node.id);
    if (index2 !== -1) {
      this._serviceableNodeIds.splice(index2, 1);
      delete this._nodes[node.id];
      this._clearFindCaches();
      node.pool.end();
    }
  }
  _clearFindCaches() {
    this._findCaches = {};
  }
};
var pool_cluster$1 = PoolCluster$1;
const Pool2 = pool;
const PoolConfig2 = pool_config;
function createPool(config) {
  return new Pool2({ config: new PoolConfig2(config) });
}
var create_pool = createPool;
const PoolCluster2 = pool_cluster$1;
function createPoolCluster(config) {
  return new PoolCluster2(config);
}
var create_pool_cluster = createPoolCluster;
var server;
var hasRequiredServer;
function requireServer() {
  if (hasRequiredServer) return server;
  hasRequiredServer = 1;
  const net = require$$0$7;
  const EventEmitter2 = require$$0$4.EventEmitter;
  const Connection3 = connection;
  const ConnectionConfig3 = connection_config;
  class Server extends EventEmitter2 {
    constructor() {
      super();
      this.connections = [];
      this._server = net.createServer(this._handleConnection.bind(this));
    }
    _handleConnection(socket) {
      const connectionConfig = new ConnectionConfig3({
        stream: socket,
        isServer: true
      });
      const connection2 = new Connection3({ config: connectionConfig });
      this.emit("connection", connection2);
    }
    listen(port) {
      this._port = port;
      this._server.listen.apply(this._server, arguments);
      return this;
    }
    close(cb) {
      this._server.close(cb);
    }
  }
  server = Server;
  return server;
}
var auth_plugins = {
  caching_sha2_password,
  mysql_clear_password,
  mysql_native_password,
  sha256_password
};
var promise = {};
var pool_cluster;
var hasRequiredPool_cluster;
function requirePool_cluster() {
  if (hasRequiredPool_cluster) return pool_cluster;
  hasRequiredPool_cluster = 1;
  const PromisePoolConnection = requirePool_connection();
  const makeDoneCb = requireMake_done_cb();
  class PromisePoolNamespace {
    constructor(poolNamespace, thePromise) {
      this.poolNamespace = poolNamespace;
      this.Promise = thePromise || Promise;
    }
    getConnection() {
      const corePoolNamespace = this.poolNamespace;
      return new this.Promise((resolve, reject) => {
        corePoolNamespace.getConnection((err, coreConnection) => {
          if (err) {
            reject(err);
          } else {
            resolve(new PromisePoolConnection(coreConnection, this.Promise));
          }
        });
      });
    }
    query(sql, values) {
      const corePoolNamespace = this.poolNamespace;
      const localErr = new Error();
      if (typeof values === "function") {
        throw new Error(
          "Callback function is not available with promise clients."
        );
      }
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        corePoolNamespace.query(sql, values, done);
      });
    }
    execute(sql, values) {
      const corePoolNamespace = this.poolNamespace;
      const localErr = new Error();
      if (typeof values === "function") {
        throw new Error(
          "Callback function is not available with promise clients."
        );
      }
      return new this.Promise((resolve, reject) => {
        const done = makeDoneCb(resolve, reject, localErr);
        corePoolNamespace.execute(sql, values, done);
      });
    }
  }
  pool_cluster = PromisePoolNamespace;
  return pool_cluster;
}
var hasRequiredPromise;
function requirePromise() {
  if (hasRequiredPromise) return promise;
  hasRequiredPromise = 1;
  (function(exports) {
    const SqlString2 = sqlstring;
    const EventEmitter2 = require$$0$4.EventEmitter;
    const parserCache2 = parser_cache;
    const PoolCluster3 = pool_cluster$1;
    const createConnection2 = create_connection;
    const createPool2 = create_pool;
    const createPoolCluster2 = create_pool_cluster;
    const PromiseConnection = requireConnection();
    const PromisePool = requirePool();
    const makeDoneCb = requireMake_done_cb();
    const PromisePoolConnection = requirePool_connection();
    const inheritEvents = requireInherit_events();
    const PromisePoolNamespace = requirePool_cluster();
    function createConnectionPromise(opts) {
      const coreConnection = createConnection2(opts);
      const createConnectionErr = new Error();
      const thePromise = opts.Promise || Promise;
      if (!thePromise) {
        throw new Error(
          "no Promise implementation available.Use promise-enabled node version or pass userland Promise implementation as parameter, for example: { Promise: require('bluebird') }"
        );
      }
      return new thePromise((resolve, reject) => {
        coreConnection.once("connect", () => {
          resolve(new PromiseConnection(coreConnection, thePromise));
        });
        coreConnection.once("error", (err) => {
          createConnectionErr.message = err.message;
          createConnectionErr.code = err.code;
          createConnectionErr.errno = err.errno;
          createConnectionErr.sqlState = err.sqlState;
          reject(createConnectionErr);
        });
      });
    }
    function createPromisePool(opts) {
      const corePool = createPool2(opts);
      const thePromise = opts.Promise || Promise;
      if (!thePromise) {
        throw new Error(
          "no Promise implementation available.Use promise-enabled node version or pass userland Promise implementation as parameter, for example: { Promise: require('bluebird') }"
        );
      }
      return new PromisePool(corePool, thePromise);
    }
    class PromisePoolCluster extends EventEmitter2 {
      constructor(poolCluster, thePromise) {
        super();
        this.poolCluster = poolCluster;
        this.Promise = thePromise || Promise;
        inheritEvents(poolCluster, this, ["warn", "remove", "online", "offline"]);
      }
      getConnection(pattern, selector) {
        const corePoolCluster = this.poolCluster;
        return new this.Promise((resolve, reject) => {
          corePoolCluster.getConnection(
            pattern,
            selector,
            (err, coreConnection) => {
              if (err) {
                reject(err);
              } else {
                resolve(new PromisePoolConnection(coreConnection, this.Promise));
              }
            }
          );
        });
      }
      query(sql, args) {
        const corePoolCluster = this.poolCluster;
        const localErr = new Error();
        if (typeof args === "function") {
          throw new Error(
            "Callback function is not available with promise clients."
          );
        }
        return new this.Promise((resolve, reject) => {
          const done = makeDoneCb(resolve, reject, localErr);
          corePoolCluster.query(sql, args, done);
        });
      }
      execute(sql, args) {
        const corePoolCluster = this.poolCluster;
        const localErr = new Error();
        if (typeof args === "function") {
          throw new Error(
            "Callback function is not available with promise clients."
          );
        }
        return new this.Promise((resolve, reject) => {
          const done = makeDoneCb(resolve, reject, localErr);
          corePoolCluster.execute(sql, args, done);
        });
      }
      of(pattern, selector) {
        return new PromisePoolNamespace(
          this.poolCluster.of(pattern, selector),
          this.Promise
        );
      }
      end() {
        const corePoolCluster = this.poolCluster;
        const localErr = new Error();
        return new this.Promise((resolve, reject) => {
          corePoolCluster.end((err) => {
            if (err) {
              localErr.message = err.message;
              localErr.code = err.code;
              localErr.errno = err.errno;
              localErr.sqlState = err.sqlState;
              localErr.sqlMessage = err.sqlMessage;
              reject(localErr);
            } else {
              resolve();
            }
          });
        });
      }
    }
    (function(functionsToWrap) {
      for (let i = 0; functionsToWrap && i < functionsToWrap.length; i++) {
        const func = functionsToWrap[i];
        if (typeof PoolCluster3.prototype[func] === "function" && PromisePoolCluster.prototype[func] === void 0) {
          PromisePoolCluster.prototype[func] = /* @__PURE__ */ function factory(funcName) {
            return function() {
              return PoolCluster3.prototype[funcName].apply(
                this.poolCluster,
                arguments
              );
            };
          }(func);
        }
      }
    })(["add", "remove"]);
    function createPromisePoolCluster(opts) {
      const corePoolCluster = createPoolCluster2(opts);
      const thePromise = opts && opts.Promise || Promise;
      if (!thePromise) {
        throw new Error(
          "no Promise implementation available.Use promise-enabled node version or pass userland Promise implementation as parameter, for example: { Promise: require('bluebird') }"
        );
      }
      return new PromisePoolCluster(corePoolCluster, thePromise);
    }
    exports.createConnection = createConnectionPromise;
    exports.createPool = createPromisePool;
    exports.createPoolCluster = createPromisePoolCluster;
    exports.escape = SqlString2.escape;
    exports.escapeId = SqlString2.escapeId;
    exports.format = SqlString2.format;
    exports.raw = SqlString2.raw;
    exports.PromisePool = PromisePool;
    exports.PromiseConnection = PromiseConnection;
    exports.PromisePoolConnection = PromisePoolConnection;
    exports.__defineGetter__("Types", () => requireTypes());
    exports.__defineGetter__(
      "Charsets",
      () => charsets
    );
    exports.__defineGetter__(
      "CharsetToEncoding",
      () => requireCharset_encodings()
    );
    exports.setMaxParserCache = function(max) {
      parserCache2.setMaxCache(max);
    };
    exports.clearParserCache = function() {
      parserCache2.clearCache();
    };
  })(promise);
  return promise;
}
(function(exports) {
  const SqlString2 = sqlstring;
  const ConnectionConfig3 = connection_config;
  const parserCache2 = parser_cache;
  const Connection3 = connection;
  exports.createConnection = create_connection;
  exports.connect = exports.createConnection;
  exports.Connection = Connection3;
  exports.ConnectionConfig = ConnectionConfig3;
  const Pool3 = pool;
  const PoolCluster3 = pool_cluster$1;
  const createPool2 = create_pool;
  const createPoolCluster2 = create_pool_cluster;
  exports.createPool = createPool2;
  exports.createPoolCluster = createPoolCluster2;
  exports.createQuery = Connection3.createQuery;
  exports.Pool = Pool3;
  exports.PoolCluster = PoolCluster3;
  exports.createServer = function(handler) {
    const Server = requireServer();
    const s = new Server();
    if (handler) {
      s.on("connection", handler);
    }
    return s;
  };
  exports.PoolConnection = pool_connection;
  exports.authPlugins = auth_plugins;
  exports.escape = SqlString2.escape;
  exports.escapeId = SqlString2.escapeId;
  exports.format = SqlString2.format;
  exports.raw = SqlString2.raw;
  exports.__defineGetter__(
    "createConnectionPromise",
    () => requirePromise().createConnection
  );
  exports.__defineGetter__(
    "createPoolPromise",
    () => requirePromise().createPool
  );
  exports.__defineGetter__(
    "createPoolClusterPromise",
    () => requirePromise().createPoolCluster
  );
  exports.__defineGetter__("Types", () => requireTypes());
  exports.__defineGetter__(
    "Charsets",
    () => charsets
  );
  exports.__defineGetter__(
    "CharsetToEncoding",
    () => requireCharset_encodings()
  );
  exports.setMaxParserCache = function(max) {
    parserCache2.setMaxCache(max);
  };
  exports.clearParserCache = function() {
    parserCache2.clearCache();
  };
})(mysql2);
const index = /* @__PURE__ */ getDefaultExportFromCjs(mysql2);
const index$1 = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: index
}, [mysql2]);
export {
  index$1 as i
};
