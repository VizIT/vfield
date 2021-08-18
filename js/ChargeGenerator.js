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

// Define the global namespaces iff not already defined.
window.vizit               = window.vizit               || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns)
 {
   /**
    * Map a set of point charges into a vertex array drawable by the
    * ChargeRenderer. Currently addition or removal of charges is not
    * expected.
    *
    * @param {Charges} charges      A collection of point charges and charge
    *                               distributions.
    *
    */
   ns.ChargeGenerator = function (charges_)
   {
     var bytesPerVertex;
     // The charge configuration we are drawing
     var charges;
     var chargesArray;
     var ncharges;
     var negativeColor;
     var neutralColor;
     var pointSize;
     var positiveColor;

     this.setCharges      = function (charges_)
     {
       charges      = charges_;
       // iff we need a larger array to hold the charge vertices, build it
       if (!chargesArray || bytesPerVertex * charges.getCharges().length > chargesArray.byteLength)
       {
         chargesArray = new ArrayBuffer(bytesPerVertex * charges.getCharges().length);
       }
     };

     this.getCharges      = function ()
     {
       return charges;
     };

     this.getChargesArray = function ()
     {
       return chargesArray;
     };

     this.getNcharges     = function ()
     {
       return ncharges;
     };

     /**
      * Populate the chargesArray with position, size, and color for each charge.
      */
     this.generate        = function ()
     {
       var charge;
       var color;
       var colorOffset;
       var colorStride;
       // view of the chargesArray in terms of unsigned bytes (Uint8)
       var colorView;
       var index;
       var position;
       var positionOffset;
       var positionSizeStride;
       // view of the chargesArray in terms of float32 elements
       var positionSizeView;
       var sizeOffset;
       var theCharges;

       theCharges         = charges.getCharges();
       ncharges           = theCharges.length;

       positionSizeView   = new Float32Array(chargesArray);
       colorView          = new Uint8Array(chargesArray);

       positionOffset     = 0;  // Floats
       sizeOffset         = 3;  // Floats
       colorOffset        = 16; // Bytes

       positionSizeStride = 5;  // Floats
       colorStride        = 20; // Bytes

       for(var i=0; i<ncharges; i++)
       {
         charge                    = theCharges[i];
         position                  = charge.getPosition();

         index                     = positionOffset + i*positionSizeStride;

         positionSizeView[index++] = position[0];
         positionSizeView[index++] = position[1];
         positionSizeView[index++] = position[2];
         positionSizeView[index++] = pointSize;

         index                     = colorOffset + i*colorStride;
         if (charge.getCharge() > 0)
         {
           color = positiveColor;
         }
         else if (charge.getCharge() < 0)
         {
           color = negativeColor;
         }
         else
         {
           color = neutralColor;
         }

         colorView[index++]        = color[0];
         colorView[index++]        = color[1];
         colorView[index++]        = color[2];
         colorView[index++]        = color[3];
       }
       return chargesArray;
     };

     bytesPerVertex =  3*Float32Array.BYTES_PER_ELEMENT // Vertex position
                     +   Float32Array.BYTES_PER_ELEMENT // Point Size
                     + 4*Uint8Array.BYTES_PER_ELEMENT;  // Point color
     pointSize      = 16;

     // TODO Set standard colors on the color utility
     negativeColor  = [204, 13,  13, 255];
     positiveColor  = [13,  13, 204, 255];
     neutralColor   = [13,  13,  13, 51];
   };
 }(window.vizit.electricfield));
