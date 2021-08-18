/**
 * Copyright 2013-2021 Vizit Solutions
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

"use strict";

window.vizit         = window.vizit         || {};
window.vizit.utility = window.vizit.utility || {};

(function (ns)
 {
   /**
    * Javascript object to wrap Float32Arrays for vertices and the indices into the vertex array.
    *
    * @param {number} maxData_     The maximum number of vertex data elements that can be stored.
    * @param {number} maxIndices_  The maximum number of indices that can be stored.
    * @constructor
    */
   ns.IndexedVertices = function (maxData_, maxIndices_)
   {
     let nindices;
     let ndatum;

     this.getNindices        = function ()
     {
       return nindices;
     };

     this.getNvertices       = function ()
     {
       return ndatum;
     };

     this.getVertices = function ()
     {
       return data;
     };

     this.push = function (datum)
     {
       data[ndatum++] = datum;
     };

     this.getIndices = function ()
     {
       return indices;
     };

     /**
      * Push an index onto the end of the list while incrementing the nindices count.
      */
     this.pushIndex  = function (index)
     {
       indices[nindices++] = index;
     };

     /**
      * Reset the accumulated indices and vertices to their initial state.
      * Zero vertices and indices.
      */
     this.reset = function()
     {
       nindices = 0;
       ndatum   = 0;
     }

     const data       = new Float32Array(maxData_);
     const indices    = new Uint16Array(maxIndices_);
     this.reset();
   };
}(window.vizit.utility));
