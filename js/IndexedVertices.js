/*
 * Copyright 2013-2014 VizIT Solutions
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
 * Javascript object to wrap Float32Arrays for vertices and the indices into the vertex array.
 *
 * @param {Integer} maxVertices_ The maximum number of verticies that can be stored.
 * @param {Integer} maxIndices_  The maximum number of indices that can be stored.
 * @constructor
 */
function IndexedVertices(maxVertices_, maxIndices_)
{
  var indices;
  var maxIndices;
  var maxVertices;
  var nindices;
  var nvertices;
  var vertices;

  this.setNindices        = function(n)
  {
    nindices = n;
  }

  this.getNindices        = function()
  {
    return nindices;
  }

  this.setNvertices       = function(n)
  {
    nvertices = n;
  }

  this.getNvertices       = function()
  {
    return nvertices;
  }

  this.setVerticies = function(geometry)
  {
    vertices = geometry;
  }

  this.getVertices = function()
  {
    return vertices;
  }

  this.setVerticies = function(geometry)
  {
    vertices = geometry;
  }

  this.getVertices = function()
  {
    return vertices;
  }

  this.pushVertex  = function(vertex)
  {
    vertices[nvertices++] = vertex;
  }

  this.setIndices  = function(indices)
  {
    indices = indices;
  }

  this.getIndices = function()
  {
    return indices;
  }

  this.pushIndex  = function(index)
  {
    indices[nindices++] = index;
  }

  maxIndices  = maxIndices_;
  maxVertices = maxVertices_;
  nindices    = 0;
  nvertices   = 0;

  vertices    = new Float32Array(3*maxVertices);
  indices     = new Uint16Array(maxIndices);
}