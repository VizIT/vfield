"use strict";
/**
 * JavaScript object for rendering a vector field.
 *
 * @param {HTMLCanvasElement} drawingSurface_ An HTML canvas into which we will render the model.
 *
 * @constructor
 */
function FieldRenderer(drawingSurface_, renderer_)
{
  /* Global variables within this field renderer. */
  var drawingSurface;
  var eventHandler;
  /** v = f(x, y, z) */
  var f;
  var glUtility;
  /** Do not rerender in response to an event until after we are initialized. */
  var initialized;
  /** Model-View matrix for use in all programs. */
  var modelViewMatrix;
  /** The specific program that controls the OpenGL. */
  var normalMatrix;
  var projectionMatrix;
  var renderer;
  /** Scale sets the bounds used in the projection matrix. */
  var scale;
  /** Start points for tracing field lines. */
  var startPoints;
  var vertexRegistry;

  this.getContext          = function()
  {
      return glUtility.getGLContext();
  }

  this.setModelViewMatrix = function(modelViewMatrix_)
  {
    modelViewMatrix = modelViewMatrix_;
    // This straight copy of the modelView matrix into the normalMatrix
    // is only valid when we are restricted to translations and rotations.
    // Scale can be handled by renormalizing - the introduction of shearing
    // or non-uniform scaling would require the use of (M^-1)^T.
    // See gl-matrix's mat3.normalFromMat4
    normalMatrix    = glUtility.extractRotationPart(modelViewMatrix, normalMatrix);
  }

  this.getModelViewMatrix = function()
  {
    return modelViewMatrix;
  }

  this.render = function()
  {
    renderer.render();
  }

  this.start              = function()
  {
    renderer.start();
  }

  this.zoomBy = function(delta)
  {
    scale += delta;
    if (scale < 1)
    {
      scale = 1;
    }
    // We project a scale x scale x scale cube into normalized device space.
    projectionMatrix     = glUtility.generateOrthographicMatrix(scale, scale, -scale, scale);
    renderer.setProjectionMatrix(projectionMatrix);
    this.render();
  }

  drawingSurface = drawingSurface_;
  glUtility      = new GLUtility(drawingSurface);
  scale          = 5;
  renderer       = renderer_;
  renderer.setGlUtility(glUtility);
  vertexRegistry = new GeometryEngine.VertexRegistry();
  // Initially an identity matrix, modified by movementEventHandler.
  modelViewMatrix = new Float32Array([1, 0, 0, 0,
                                      0, 1, 0, 0,
                                      0, 0, 1, 0,
                                      0, 0, 0, 1]);

  normalMatrix    = new Float32Array([1, 0, 0,
                                      0, 1, 0,
                                      0, 0, 1]);

  projectionMatrix     = glUtility.generateOrthographicMatrix(scale, scale, -scale, scale);

  renderer.setModelViewMatrix(modelViewMatrix);
  renderer.setProjectionMatrix(projectionMatrix);
  // motionEventHandler(target_, utility_, mouseScale_, pinchScale_)
  eventHandler             = new MotionEventHandler(this, glUtility, 75, 4);
  drawingSurface.addEventListener("mousewheel", eventHandler.handleMouseWheel.bind(eventHandler), false);
  drawingSurface.addEventListener("mousedown",  eventHandler.handleMouseDown.bind(eventHandler),  false);
  document.addEventListener("mouseup",          eventHandler.handleMouseUp.bind(eventHandler),    false);
  document.addEventListener("mousemove",        eventHandler.handleMouseMove.bind(eventHandler),  false);
  drawingSurface.addEventListener("touchstart", eventHandler.handleTouchStart.bind(eventHandler), false);
  drawingSurface.addEventListener("touchmove",  eventHandler.handleTouchMove.bind(eventHandler),  false);
  drawingSurface.addEventListener("touchend",   eventHandler.handleTouchEnd.bind(eventHandler),   false);
}