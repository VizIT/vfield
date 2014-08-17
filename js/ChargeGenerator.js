"use strict";

/**
 * Copyright 2013-2014 Vizit Solutions
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

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

