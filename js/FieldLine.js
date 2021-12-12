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

window.vizit = window.vizit || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns) {
    /**
     * Reusable container for a field line and associated quantities. This version
     * represents each A-B line segment in a way that is suitable for converting
     * into a rectangle in the vertex shader. For each pair, we include
     * vert3(a), vert3(b), -1
     * vert3(a), vert3(b), +1
     * vert3(b), vert3(a), -1
     * vert3(b), vert3(a), +1
     * where each of sets of data triggers the generation of one corner of the rectangle.
     *
     * @param {number} maxPoints_ An integer giving the maximum number of points on any line to be processed
     *
     * @see FieldLineRenderer
     * @see FieldLineGenerator
     */
    ns.FieldLine = function (maxPoints_) {
        let arrowIndices;
        let arrowIndexPtr;
        let arrowVertexPtr;
        /** A Float32Array containing four vertices for each arrow. */
        let arrowVertices;
        let maxPoints;
        /** The number of arrowVertices drawn along the field line. There are twice this number of lines. */
        let narrows;
        /** The number of points in the field line so far. */
        let npoints;
        /** The Float32Array containing the points along the line.*/
        let points;
        /** The index where the next point coordinate will be written. */
        let pointsPtr;
        let lastPoint;

        /*
         * Set the maximum number of points this field line can contain.
         * @param {number} maxPoints_ An integer giving the maximum number of points on any line to be processed
         */
        this.setMaxPoints = function (maxPoints_) {
            if (maxPoints_ !== maxPoints) {
                maxPoints     = maxPoints_;
                // For each AB pair of points,
                points        = new Float32Array(ns.FieldLine.FLOATS_PER_SEGMENT * (maxPoints-1));
                arrowVertices = new Float32Array(maxPoints);
                arrowIndices  = new Uint16Array(maxPoints);
                this.reset();
            }
            return this;
        };

        this.getMaxPoints = function () {
            return maxPoints;
        };

        /**
         * Push data to generate one vertex, or one corner of the rectangle representing the a line segment.
         * @param {number} currentX The center x coordinate of the current edge of the rectangle
         * @param {number} currentY The center y coordinate of the current edge of the rectangle
         * @param {number} currentZ The center z coordinate of the current edge of the rectangle
         * @param {number} otherX The center x coordinate of the other edge of the rectangle
         * @param {number} otherY The center x coordinate of the other edge of the rectangle
         * @param {number} otherZ The center x coordinate of the other edge of the rectangle
         * @param {number} direction The direction to displace from the current center to place the vertex
         */
        function pushVertex(currentX, currentY, currentZ, otherX, otherY, otherZ, direction) {
            // vec3 for the current point
            points[pointsPtr++] = currentX;
            points[pointsPtr++] = currentY;
            points[pointsPtr++] = currentZ;

            // vec3 for the other point
            points[pointsPtr++] = otherX;
            points[pointsPtr++] = otherY;
            points[pointsPtr++] = otherZ;

            // Displacement direction
            points[pointsPtr++] = direction;
        }

        /**
         * Push a new point along the line. The line is defined by the sequence of points, in the order given.
         *
         * @param {number} x The x coordinate of this point along the line.
         * @param {number} y The y coordinate of this point along the line.
         * @param {number} z The z coordinate of this point along the line.
         */
        this.pushPoint = function (x, y, z) {
            if (npoints > 0) {
                // The first edge of the rectangle
                pushVertex(lastPoint.x, lastPoint.y, lastPoint.z, // vec3 for the current point
                    x, y, z,                                      // vec3 for the other point
                    +1.0);                                // Displacement direction

                pushVertex(lastPoint.x, lastPoint.y, lastPoint.z, // vec3 for the current point
                    x, y, z,                                      // vec3 for the other point
                    -1.0);                                // The opposite displacement direction

                // The second edge of the rectangle
                pushVertex(x, y, z,
                    lastPoint.x, lastPoint.y, lastPoint.z,
                    -1.0);

                pushVertex(x, y, z,
                    lastPoint.x, lastPoint.y, lastPoint.z,
                    +1.0);
            }
            lastPoint = {
                x: x,
                y: y,
                z: z
            };

            npoints++;
        };

        this.getPoints = function () {
            return points;
        };

        this.getNpoints = function () {
            return npoints;
        };

        function makeArrowVertex(vertex, tip, direction) {
            arrowVertices[arrowVertexPtr++] = vertex.x;
            arrowVertices[arrowVertexPtr++] = vertex.y;
            arrowVertices[arrowVertexPtr++] = vertex.z;
            arrowVertices[arrowVertexPtr++] = tip.x;
            arrowVertices[arrowVertexPtr++] = tip.y;
            arrowVertices[arrowVertexPtr++] = tip.z;
            arrowVertices[arrowVertexPtr++] = direction;
        }

        /**
         * Push a directional arrow onto the field line.
         * @param {Object} base The x, y, z coordinates of the base of the arrow.
         * @param {Object} tip The x, y, z coordinates of the tip of the arrow.
         */
        this.pushArrow = function (base, tip) {
            makeArrowVertex(base, tip, +1.0);
            makeArrowVertex(base, tip,  0.0);
            makeArrowVertex(tip,  tip,  0.0);
            makeArrowVertex(base, tip, -1.0);

            const baseIndex = narrows * ns.FieldLine.VERTICES_PER_ARROW;

            // The upper half of the arrow
            arrowIndices[arrowIndexPtr++] = baseIndex;
            arrowIndices[arrowIndexPtr++] = baseIndex + 1;
            arrowIndices[arrowIndexPtr++] = baseIndex + 2;

            // Lower half of the arrow
            arrowIndices[arrowIndexPtr++] = baseIndex + 2;
            arrowIndices[arrowIndexPtr++] = baseIndex + 1;
            arrowIndices[arrowIndexPtr++] = baseIndex + 3;

            narrows++;
        };

        this.getArrows = function () {
            // TODO: Can arrayBufferView be used here?
            // https://heycam.github.io/webidl/#ArrayBufferView
            return {
                vertices: arrowVertices.slice(0, vizit.electricfield.FieldLine.VERTICES_PER_ARROW
                                                 *vizit.electricfield.FieldLine.FLOATS_PER_VERTEX
                                                 *narrows),
                indices: arrowIndices.slice(0, vizit.electricfield.FieldLine.INDICES_PER_ARROW
                                               *narrows),
                narrows: narrows
            }
        };

        this.getNarrows = function () {
            return narrows;
        };

        /**
         * Reset counters and pointer to the beginning of the arrays.
         */
        this.reset = function () {
            arrowIndexPtr = 0;
            arrowVertexPtr = 0;
            narrows = 0;
            npoints = 0;
            pointsPtr = 0;
        };

        this.setMaxPoints(maxPoints_);
    };

    ns.FieldLine.FLOATS_PER_LOCATION  = 3;
    /** We have the current location and the other location for each end of a line segment. */
    ns.FieldLine.LOCATIONS_PER_VERTEX = 2;
    ns.FieldLine.FLOATS_PER_DIRECTION = 1;
    /** Each vertex has the current location, the other location, and the displacement direction. */
    ns.FieldLine.FLOATS_PER_VERTEX    = ns.FieldLine.LOCATIONS_PER_VERTEX*ns.FieldLine.FLOATS_PER_LOCATION + ns.FieldLine.FLOATS_PER_DIRECTION;
    ns.FieldLine.VERTICES_PER_SEGMENT = 4;
    ns.FieldLine.FLOATS_PER_SEGMENT   = ns.FieldLine.VERTICES_PER_SEGMENT*(ns.FieldLine.FLOATS_PER_VERTEX);

    ns.FieldLine.VERTICES_PER_ARROW   = 4;
    ns.FieldLine.INDICES_PER_ARROW    = 6;

}(window.vizit.electricfield));
