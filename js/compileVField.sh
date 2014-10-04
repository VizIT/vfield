#!/bin/bash
# Simple script to combine the components of the vfield package into one minified file.

# Put the paths to your java and closure compiler here.
# See https://developers.google.com/closure/compiler/docs/gettingstarted_app
JAVA=/usr/bin/java
CLOSURE_HOME=/opt/closure

$JAVA -jar $CLOSURE_HOME/compiler.jar --js current_license.js \
  MotionEventHandler.js GLUtility.js Color.js Geometry.js SurfaceRenderer.js IndexedVertices.js \
  VectorFunction.js CombinedVectorFunctions.js LineRenderer.js SimpleVectorField.js \
  CountdownLatch.js ChargeGenerator.js ChargeRenderer.js FieldLineVBO.js FieldLine.js \
  FieldLineGenerator.js FieldLineRenderer.js Cylinder.js GaussianCylinder.js \
  GaussianSphere.js ChargedCylinder.js ChargedLine.js ChargedPlane.js ChargedSphere.js \
  Charges.js ElectricField.js VectorFieldGenerator.js FieldRenderer.js \
  CombinedVectorValuedFunctionBuilder.js SurfaceBuilder.js VectorValuedFunctionBuilder.js \
  DistributionBuilder.js ChargesBuilder.js BindingBuilder.js ElectricFieldElementBuilder.js \
  ElectricFieldBuilder.js SimpleVectorFieldBuilder.js VizBuilder.js \
  --js_output_file VField.min.js
