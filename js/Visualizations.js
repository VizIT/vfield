/*
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

"use strict";

window.vizit = window.vizit || {};

(function (ns)
{
    /**
     * Common repository for registration and retreival of visualizations
     * by name. This allows configured visualizations to be accessed by
     * other components.
     */
    ns.Visualizations = function ()
    {
        var visualizations;

        this.register = function (name, visualization)
        {
            visualizations[name] = visualization;
        };

        this.lookup = function (name)
        {
            var visualization;

            if (visualizations.hasOwnProperty(name))
            {
                visualization = visualizations[name];
            }

            return visualization;
        };
    };
}(window.vizit));

vizit.visualizations = new vizit.Visualizations();