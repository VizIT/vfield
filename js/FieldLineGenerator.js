/*
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

// Define the global namespaces iff not already defined.
window.vizit               = window.vizit               || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns) {
    /**
     * Compute vectors along a field line from a given starting point for a
     * configuration charges. The expectation is that the object will be reused
     * to compute field lines for multiple start points, which will be immediately
     * loaded as VBOs onto the GPU.
     *
     * @param {double}  maxPoints_    The maximum number of steps, of length ds, taken
     *                                along a field line.
     *
     * @param {double}  ds_           Step size for tracing field lines.
     *
     * @class
     */
    ns.FieldLineGenerator = function (maxPoints_, ds_) {
        /** Base to tip length of a directional arrow. */
        let arrowLength;
        /** The barb to barb width of an arrow in pixels */
        let arrowWidth;
        /** The sum of ds along the path increments by this much between arrows. */
        let arrowSpacing;
        /** Each point represents a distance ds along the field line. */
        let ds;
        /** The charge configuration we are drawing the field lines for. */
        let charges;
        /** Container for generated field line and direction indicators. */
        let fieldLine;
        /** The maximum number of points along the line to trace. */
        let maxPoints;

        /**
         * Set or update the set of charges generating the electric field.
         *
         * @param {Charges} charges       A collection of point charges and charge
         *                                distributions.
         *
         * @returns {vizit.electricfield.FieldLineGenerator}
         */
        this.setCharges = function (charges_) {
            charges = charges_;
            return this;
        };

        this.getCharges = function () {
            return charges;
        };

        this.getArrows = function () {
            return arrows;
        };

        this.setMaxPoints = function (maxPoints_) {
            if (maxPoints_ > maxpoints) {
                fieldLine = new vizit.electricfield.FieldLine(maxPoints);
            }
            maxPoints = maxPoints_;
            return this;
        };

        this.getMaxPoints = function () {
            return maxPoints;
        };

        /**
         * Set the base to tip length for arrows indicating the field direction.
         *
         * @param {double}  length   Base to tip length of a directional arrow.
         *
         * @returns {vizit.electricfield.FieldLineGenerator}
         */
        this.setArrowLength = function (length) {
            arrowLength = length;
            return this;
        };

        this.getArrowLength = function () {
            return arrowLength;
        };

        /**
         * Set the barb to barb width of the vector's arrowhead.
         *
         * @param {number} width The barb to barb width of an arrow head.
         *
         * @returns {vizit.electricfield.FieldLineGenerator}
         */
        this.setArrowWidth = function(width) {
            arrowWidth = width;
            return this;
        }

        this.getArrowWidth = function() {
            return arrowWidth;
        }

        /**
         * Set the spacing between directional arrows.
         *
         * @param {number}  arrowSpacing  A float giving the field length between directional arrows.
         *
         * @returns {vizit.electricfield.FieldLineGenerator}
         */
        this.setArrowSpacing = function (spacing) {
            arrowSpacing = spacing;
            return this;
        };

        this.getArrowSpacing = function () {
            return arrowSpacing;
        };

        this.setDs = function (ds_) {
            ds = ds_;
            return this;
        };

        this.getDs = function () {
            return ds;
        };

        /**
         * Generate points for an arrow head along the field line indicating the
         * direction of the electric field. The arrowhead is constructed in the
         * vertex shader.
         *
         * @param {number} x0 x coordinate for the tip of the arrow
         * @param {number} y0 y coordinate for the tip of the arrow
         * @param {number} z0 z coordinate for the tip of the arrow
         * @param {number[]} field Components of the field at the tip
         * @param {number} f Magnitude of the field at the tip
         * @param {number} arrowLength The base to tip distance for the arrow
         * @param {FieldLine} fieldLine The object representing the current field
         * @param {number} sgn Whether to trace the line along (+1.0) or
         *                      in opposition to (-1.0) the electric field.
         */
        this.drawArrow = function (x0, y0, z0, field, f, arrowLength, fieldLine, sgn) {
            // You might be tempted to use Float32Array here, but many small typed arrays
            // are counter productive.
            const tip = {
                x: x0,
                y: y0,
                z: z0
            };
            // The base is a step back from the tip in the direction of the field
            const base = {
                x: x0 - arrowLength * field[0] / f,
                y: y0 - arrowLength * field[1] / f,
                z: z0 - arrowLength * field[2] / f
            };

            fieldLine.pushArrow(base, tip);
        };

        /**
         * Trace a field line starting at the given x, y, z coordinates.
         * Each step of length ds has components (Ex/E*ds, Ey/E*ds, Ez/E*ds).
         * points is usually a Float32Array of size 3*maxPoints. Trace along
         * or against the field according to sgn.
         *
         * @param {number} x0 x coordinate of the start of the field line
         * @param {number} y0 y coordinate of the start of the field line
         * @param {number} z0 z coordinate of the start of the field line
         * @param {number} sgn  Whether to trace the line along (+1.0) or
         *                      in opposition to (-1.0) the electric field.
         */
        this.generate = function (x0, y0, z0, sgn) {
            // The distance traversed along the field line since the last arrow was drawn.
            var deltaS;
            var f;
            var field;
            var i;
            // The vector function thinks we are at a sink and should stop tracing a field line.
            var shouldStop;
            var x;
            var y;
            var z;

            deltaS = 0;
            shouldStop = false;
            x = x0;
            y = y0;
            z = z0;
            fieldLine.reset();

            for (i = 0; i < maxPoints && !shouldStop; i++) {
                fieldLine.pushPoint(x, y, z);
                field = charges.getField(x, y, z);
                f = Math.sqrt(field[0] * field[0] + field[1] * field[1] + field[2] * field[2]);

                if (f === 0) {
                    // No field here - no possible field line
                    break;
                }

                x += sgn * field[0] / f * ds;
                y += sgn * field[1] / f * ds;
                z += sgn * field[2] / f * ds;

                deltaS += ds;

                if (deltaS > arrowSpacing) {
                    deltaS = 0;
                    this.drawArrow(x, y, z, field, f, arrowLength, fieldLine, sgn);
                }

                shouldStop = charges.shouldStop(sgn, x, y, z);
            }
            return fieldLine;
        };

        arrowLength = ns.FieldLineGenerator.DEFAULT_ARROW_LENGTH;
        arrowSpacing = ns.FieldLineGenerator.DEFAULT_ARROW_SPACING;
        ds = ds_;
        maxPoints = maxPoints_;
        fieldLine = new vizit.electricfield.FieldLine(maxPoints);
    };

    ns.FieldLineGenerator.DEFAULT_ARROW_LENGTH  = 4.0;
    ns.FieldLineGenerator.DEFAULT_ARROW_SPACING = 24.0;

}(window.vizit.electricfield));
