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
 * Container for the line and direction indicators for a field line.
 * NOTE: Consider combining these into a single VBO.
 */
function FieldLineVBO(glUtility, fieldLine)
{
  this.fieldLineBufferHandle      = glUtility.createBuffer(fieldLine.getPoints());
  this.npoints                    = fieldLine.getNpoints();
  this.fieldDirectionBufferHandle = glUtility.createBuffer(fieldLine.getArrows());
  this.narrows                    = fieldLine.getNarrows();
}