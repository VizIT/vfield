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
   /**
    * Wait for count invocations of the countDown method, then invoke onDone.
    * For example, wait for resources and invocation of renderer start method
    * before starting rendering.
    */
   ns.CountdownLatch = function (count_, onDone_)
   {
     var count  = count_;
     var onDone = onDone_;

     /**
      * Decrement the count of items we are waiting on. Proceed when the count
      * drops to zero.
      * @callback latchCallback
      */
     this.countDown = function ()
     {
       count--;
       if (count <= 0)
       {
	 onDone();
       }
     };
   };
}(window.vizit.utility));