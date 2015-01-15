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
   /**
    * Handle mouse and touch events for manipulting WebGL graphics
    *
    * @param {HTMLCanvasElement} target_     An HTML canvas on which we are listening for events.
    * @param {GLUtility}         utility_    Provides matrix utility methods.
    * @param {Double}            mouseScale_ Scale factor (divisor) between mouse movements and canvas scaling.
    * @param {Double}            pinchScale_ Scale factor (divisor) between finger movements and canvas scaling.
    *
    * @constructor
    */
   ns.MotionEventHandler = function (target_, utility_, mouseScale_, pinchScale_)
   {
     var activeTouches;
     // Is the mouse pressed in the canvas. Ignore mouse event if not.
     var inprogress;
     var lastX;
     var lastY;
     var mouseScale;
     var pinchScale;
     var target;
     var utility;

     activeTouches = new Array();
     inprogress    = false;
     lastX         = null;
     lastY         = null;
     mouseScale    = mouseScale_;
     pinchScale    = pinchScale_;
     target        = target_;
     utility       = utility_;

     this.findTouchByIdentifier = function (identifier_)
     {
       var i;
       var identifier;

       for (i=0; i<activeTouches.length; i++)
       {
         identifier = activeTouches[i].identifier;

         if (identifier === identifier_)
         {
           return i;
         }
       }
       // Never found a match
       return -1;
     };

     this.handleTouchStart = function (event)
     {
       var i;
       var touch;
       var touches;

       // We only care abut touches that at least started out in the
       // element.
       touches = event.targetTouches;

       for (i=0; i<touches.length; i++)
       {
         touch = touches[i];
         if (this.findTouchByIdentifier(touch.identifier) === -1)
         {
           activeTouches.push(touch);
         }

       }

       // Indicate we have done all needed processing on this event
       if (event.preventDefault)
       {
         event.preventDefault();
       }
       else
       {
         return false;
       }
     };

     this.handleTouchEnd = function (event)
     {
       var i;
       var index;
       var touches;

       // The touches that triggered the event.
       touches = event.changedTouches;

       for(i=0; i<touches.length; i++)
       {
         index = this.findTouchByIdentifier(touches[i].identifier);
         if (index !== -1)
         {
           // Remove the one entry at index from the array.
           activeTouches.splice(index, 1);
         }
       }

       // Indicate we have done all needed processing on this event
       if (event.preventDefault)
       {
         event.preventDefault();
       }
       else
       {
         return false;
       }
     };

     /*
      * Touch move events when there is one active touch are delegated
      * to this method. These move events are translated into a rotation.
      */
     this.handleOneActiveMove = function (event)
     {
       var deltaX;
       var deltaY;
       var modelViewMatrix;
       var newTouch;
       var oldTouch;

       newTouch = event.changedTouches[0];
       oldTouch = activeTouches[0];
       if (oldTouch !== null)
       {
         deltaX   = newTouch.pageX - oldTouch.pageX;
         deltaY   = newTouch.pageY - oldTouch.pageY;

         modelViewMatrix = target.getModelViewMatrix();
         // Rotate the model view by phi radians about the X axis
         // an theta radians about the Y axis.
         utility.rotateBy(modelViewMatrix, deltaY/150, deltaX/150);
         target.setModelViewMatrix(modelViewMatrix);
         target.requestRender();

         // Replace the old touch with the new touch, and hence new location.
         activeTouches.splice(0, 1, newTouch); 
       }
       else
       {
         activeTouches.push(newTouch);
       }

       // Indicate we have done all needed processing on this event
       if (event.preventDefault)
       {
         event.preventDefault();
       }
       else
       {
         return false;
       }
     };

     /*
      * Handle a move event with two active touches. This will correspond to
      * a scale event.
      */
     this.handleTwoActiveMove = function (event)
     {
       var deltaScale;
       var deltaX;
       var deltaY;
       var i;
       var identifier;
       var r0;
       var r1;
       var touch;
       var touch0;
       var touch1;
       var touches;

       touch0  = activeTouches[0];
       touch1  = activeTouches[1];
       deltaX  = touch1.pageX - touch0.pageX;
       deltaY  = touch1.pageY - touch0.pageY;
       r0      = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

       touches = event.changedTouches;

       for(i=0; i<touches.length; i++)
       {
         touch      = touches[i];
         identifier = touch.identifier;
         // Replace the touch that matches the identifier of the changed touch
         if (touch0.identifier === identifier)
         {
           touch0 = touch;
           activeTouches.splice(0, 1, touch);
         }
         else if (touch1.identifier === identifier)
         {
           touch1 = touch;
           activeTouches.splice(1, 1, touch);
         }
       }

       deltaX     = touch1.pageX - touch0.pageX;
       deltaY     = touch1.pageY - touch0.pageY;
       r1         = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

       deltaScale = r1-r0;

       target.zoomBy(-deltaScale/pinchScale);

       // Indicate we have done all needed processing on this event
       if (event.preventDefault)
       {
         event.preventDefault();
       }
       else
       {
         return false;
       }
     };

     this.handleTouchMove = function (event)
     {
       if (activeTouches.length === 1)
       {
         return this.handleOneActiveMove(event);
       }
       else if (activeTouches.length === 2)
       {
         return this.handleTwoActiveMove(event);
       }
       return true;
     };

     this.handleMouseDown = function (event)
     {
       inprogress = true;
       lastX      = event.clientX;
       lastY      = event.clientY;
     };

     this.handleMouseUp  = function (event)
     {
       inprogress = false;
     };

     this.handleMouseMove = function (event)
     {
       if (!inprogress)
       {
         return;
       }

       var modelViewMatrix;

       var newX   = event.clientX;
       var newY   = event.clientY;

       var deltaX = newX - lastX;
       var deltaY = newY - lastY;

       modelViewMatrix = target.getModelViewMatrix();
       // Rotate the model view by phi radians about the X axis
       // an theta radians about the Y axis.
       utility.rotateBy(modelViewMatrix, deltaY/30, deltaX/30);
       target.setModelViewMatrix(modelViewMatrix);
       target.requestRender();

       lastX = newX;
       lastY = newY;
     };

     this.handleMouseWheel = function (event_)
     {
       var event;

       //equalize event object
       event=window.event || event_;

       target.zoomBy(event.wheelDeltaY/mouseScale);

       // Indicate we have done all needed processing on this event
       if (event.preventDefault)
       {
         event.preventDefault();
       }
       else
       {
         return false;
       }
     };
   };
}(window.vizit.utility));
