"use strict";

/**
 * Copyright 2014 Vizit Solutions
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
   ns.toBoolean = function(value)
   {
     var result;
     var type;

     type = typeof value;
       
     if (type === "boolean")
     {
       result = value;
     }
     else if (type === "number")
     {
       result = value !== 0;
     }
     else if (type === "string")
     {
       switch (value.trim().toLowerCase())
       {
           case "f":
           case "false":
           case "n":
           case "no":
           case "0":
           case "": result = false;
           default: result = true;
       }
     }
     
     return result;
   };
 }(window.vizit.utility));
