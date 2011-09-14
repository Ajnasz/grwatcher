/**
  * Applies all properties in the supplier to the receiver if the
  * receiver does not have these properties yet.  Optionally, one or 
  * more methods/properties can be specified (as additional 
  * parameters).  This option will overwrite the property if receiver 
  * has it already.  If true is passed as the third parameter, all 
  * properties will be applied and _will_ overwrite properties in 
  * the receiver.
  *
  * @method augmentObject
  * @namespace GRW
  * @static
  * @since 2.3.0
  * @see YAHOO.lang.augmentObject
  * @param {Function} r  the object to receive the augmentation
  * @param {Function} s  the object that supplies the properties to augment
  * @param {String*|boolean}  arguments zero or more properties methods 
  *        to augment the receiver with.  If none specified, everything
  *        in the supplier will be used unless it would
  *        overwrite an existing property in the receiver. If true
  *        is specified as the third parameter, all properties will
  *        be applied and will overwrite an existing property in
  *        the receiver
  */
var augmentObject = function(r, s) {
  if (!s||!r) {
      throw new Error("Absorb failed, verify dependencies.");
  }
  var a=arguments, overrideList=a[2];
  if (overrideList && overrideList!==true) { // only absorb the specified properties
    for (let i=2, al = a.length; i<al; i=i+1) {
        r[a[i]] = s[a[i]];
    }
  } else { // take everything, overwriting only if the third parameter is true
    for (let p in s) {
      if (overrideList || !(p in r)) {
        r[p] = s[p];
      }
    }
  }
};

/**
  * Same as GRW.augmentObject, except it only applies prototype properties
  * @see GRW.augmentObject
  * @see YAHOO.lang.augmentProto
  * @method augmentProto
  * @static
  * @param {Function} r  the object to receive the augmentation
  * @param {Function} s  the object that supplies the properties to augment
  * @param {String*|boolean}  arguments zero or more properties methods
  *        to augment the receiver with.  If none specified, everything
  *        in the supplier will be used unless it would overwrite an existing
  *        property in the receiver.  if true is specified as the third
  *        parameter, all properties will be applied and will overwrite an
  *        existing property in the receiver
  */
var augmentProto = function(r, s) {
  if (!s||!r) {
      throw new Error("Augment failed, verify dependencies.");
  }
  var a=[r.prototype,s.prototype];
  for (let i=2, al = arguments.length;i<al;i=i+1) {
      a.push(arguments[i]);
  }
  augmentObject.apply(this, a);
};

let EXPORTED_SYMBOLS = ['augmentObject', 'augmentProto'];
