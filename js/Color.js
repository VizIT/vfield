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

window.vizit         = window.vizit         || {};
window.vizit.utility = window.vizit.utility || {};

(function (ns)
 {
   ns.Color = function (red, green, blue, alpha)
   {
     var r, g, b, a;

     this.setRed       = function (red)
     {
       r = red;
       return this;
     }

     this.getRed       = function ()
     {
       return r;
     }

     this.setGreen     = function (green)
     {
       g = green;
       return this;
     }

     this.getGreen     = function ()
     {
       return g;
     }

     this.setBlue      = function (blue)
     {
       b = blue;
       return this;
     }

     this.getBlue      = function ()
     {
       return b;
     }

     this.setAlpha     = function (alpha)
     {
       a = alpha;
       return this;
     }

     this.getAlpha     = function ()
     {
       return a;
     }

     this.setRed(red)
         .setGreen(green)
         .setBlue(blue)
         .setAlpha(alpha);
   }
}(window.vizit.utility));
