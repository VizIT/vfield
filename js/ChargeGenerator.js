/**
 * Map a set of point charges into a vertex array drawable by the
 * ChargeRenderer. Currently addition or removal of charges is not
 * expected.
 *
 * @param {Charges} charges      A collection of point charges and charge
 *                               distributions.
 *
 */
function ChargeGenerator(charges_)
{
  // The charge configuration we are drawing
  var charges;
  var chargesArray;
  var ncharges;

  this.getChargesArray = function()
  {
    return chargesArray;
  }

  this.getNcharges     = function()
  {
    return ncharges;
  }

  /**
   * 
   */
  this.generate        = function()
  {
    var charge;
    var offset;
    var position;
    var theCharges;
     
    theCharges   = charges.getCharges();
    ncharges     = theCharges.length;
    offset       = 0;

    for(var i=0; i<ncharges; i++)
    {
      charge                 = theCharges[i];
      position               = charge.getPosition();
      chargesArray[offset++] = position[0];
      chargesArray[offset++] = position[1];
      chargesArray[offset++] = position[2];
      chargesArray[offset++] = charge.getCharge();
    }
    return chargesArray;
  }

  charges      = charges_;
  chargesArray = new Float32Array(4*charges.getCharges().length);
}

