"use strict";

/**
 *  @license Copyright 2013-2014 Vizit Solutions
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * A collection of functions, yielding sum from 0 to i of f_i(x, y, z).
 * And track common attributes, such as whether any of the functions have
 * been modified.
 */
function CombinedVectorFunctions()
{
    var functions;
    var nfunctions;

    /**
     * Add a function to the collection.
     */
    this.addFunction = function (f)
    {
      nfunctions = functions.push(f);
      return this;
    }

    // If any functions are passed into the constructor, add them immediatly
    // to the set.
    for (var i=0; i<arguments.length; i++)
    {
      this.addFunction(arguments[i]);
    }

    this.getNfunctions = function ()
    {
      return nfunctions;
    }

    this.getFunctions = function ()
    {
      return functions;
    }

    this.isModified   = function ()
    {
      var modified;

      modified = false;

      for (i=0; i<nfunctions && !modified; i++)
      {
        modified = modified || functions[i].isModified();
      }

      return modified;
    }

    this.setModified         = function (modified)
    {
      for (i=0; i<nfunctions; i++)
      {
        functions[i].setModified(modified);
      }
    }

    /**
     * Get start points using, for now, preset values of phi0 and r
     */
    this.getStartPoints = function ()
    {
      var i;
      var r0     = 6.0;
      var phi    = 0.0;
      var dphi   = 1.57079632679/(ncharges+1);
      var f;
      var points = new Array();

      for(i=0; i<nfunctions; i++)
      {
        f      = functions[i];
        points = points.concat(f.getStartPoints(phi, r0));
        phi   += dphi;
      }

      return points;
    }

    /**
     * Comnpute the field at x, y, z by summing contributions from each function.
     */
    this.getField = function (x, y, z)
    {
      // Field from the current function
      var currentField;
      // The summed field vector
      var field          = new Array(0, 0, 0);

      for(var i=0; i<nfunctions; i++)
      {
        currentField = functions[i].getField(x, y, z);
        field[0]    += currentField[0];
        field[1]    += currentField[1];
        field[2]    += currentField[2];
      }

      return field;
    }

    /**
     * Determine if tracing a field line should stop.
     *
     * @param {double} sgn
     *
     * @param {double} x
     *
     * @param {double} y
     *
     * @param {double} z
     *
     */
    this.shouldStop    = function (sgn, x, y, z)
    {
      var should;

      should = false;

      for(var i=0; i<ncharges & !should; i++)
      {
        should = functions[i].shouldStop(sgn, x, y, z);
      }
      return should;
    }

    nfunctions = 0;
    functions  = new Array();
}



