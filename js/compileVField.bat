@echo off
REM Simple script to combine the components of the vfield package into one minified file.

REM Put the paths to your java and closure compiler here.
REM See https://developers.google.com/closure/compiler/docs/gettingstarted_app
set JAVA="C:\Program Files\Java\jre1.8.0_211\bin\java.exe"
set CLOSURE_HOME="C:\Program Files\closure"

%JAVA% -jar %CLOSURE_HOME%\compiler.jar --js current_license.js ^
  IllegalArgumentException.js EnsureNumber.js toBoolean.js MotionEventHandler.js GLUtility.js ^
  Color.js Geometry.js SurfaceRenderer.js IndexedVertices.js VectorFunction.js CombinedVectorFunctions.js ^
  LineRenderer.js SimpleVectorField.js CountdownLatch.js ChargeGenerator.js ChargeRenderer.js ^
  FieldLineVBO.js FieldLine.js FieldLineGenerator.js FieldLineRenderer.js Cylinder.js ^
  GaussianCylinder.js GaussianSphere.js ChargedCylinder.js ChargedLine.js ChargedPlane.js ^
  ChargedSphere.js Charges.js ElectricField.js VectorFieldGenerator.js Stage.js ^
  BindingBuilder.js CombinedVectorValuedFunctionBuilder.js SurfaceBuilder.js VectorValuedFunctionBuilder.js ^
  DistributionBuilder.js ChargesBuilder.js ElectricFieldElementBuilder.js ^
  Visualizations.js ElectricFieldBuilder.js SimpleVectorFieldBuilder.js VizBuilder.js ^
  --language_in ES6 ^
  --language_out ES6 ^
  --js_output_file VField.min.js ^
  --create_source_map="VField.min.js.map"

  echo //# sourceMappingURL=VField.min.js.map >> VField.min.js
