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
 * Build a visualization declaritively using JSON.
 */
function VizBuilder()
{
  var chargeDensityRE;
  var fieldLineDensityRE;
  var errorMessage;
  var warningMessage;
      
  // ===========================================================
  // Point charge builders.
  // ===========================================================

  /**
   * Build a single point charge from the charges section of the config object.
   *
   * @param {object} config The portion of a visualization configuration
   *                        defining a single point charge.
   */
  this.chargeBuilder = function(config)
  {
    var charge;
    /** Error message why the error flag was set. */
    var message;
    // Magnitude of the charge
    var q;
    // Position of the charge
    var x, y, z;
    // number of field lines per unit charge, or the number of field lines.
    var rho, nlines;
    // Name and value of the properties on the config object.
    var name, value;

    // We know in what follows that this is a string.
    message = "";

    // Reasonable becaue this is a small object with few properties.
    for(var name in config)
    {
      if(name.toLowerCase() === "q")
      {
        q = config[name];
      }
      else if (name.toLowerCase() === "x")
      {
        x = config[name];
      }
      else if (name.toLowerCase() === "y")
      {
        y = config[name];
      }
      else if (name.toLowerCase() === "z")
      {
        z = config[name];
      }
      else if (name.toLowerCase() === "rho")
      {
        rho = config[name];
      }
      else if (name.toLowerCase() === "nlines")
      {
        nlines = config[name];
      }
    }

    if (typeof q === "undefined")
    {
      message = "No charge (Q) on electric charge.";
    }

    if (typeof x === "undefined")
    {
      if (message.length > 0)
      {
        message += "\n";
      }
      message += "x coordinate is not defined in charge configuration.";
    }

    if (typeof y === "undefined")
    {
      if (message.length > 0)
      {
        message += "\n";
      }
      message += "y coordinate is not defined in charge configuration.";
    }

    if (typeof z === "undefined")
    {
      if (message.length > 0)
      {
        message += "\n";
      }
      message += "z coordinate is not defined in charge configuration.";
    }

    if (message.length == 0)
    {
      charge = new Charge(q, x, y, z, rho);
    }

    return charge;
  }

  /**
   * Process one or more charges provided in a visualization configuration into
   * a Charges collection
   *
   * @param   {object|Array} Configuraction object fo a single charge or array of charges,
   *                         each of which specifices a charge, Q, position (x,y,z) and
   *                         optionally rho, the ratio of field lines to charge, or lines,
   *                         the count of field lines.
   *
   * @returns {Charges}
   */
  this.chargesBuilder = function(config, charges)
  {
    var charge;
    var ncharges;

    if (!!config)
    {
      if (Array.isArray(config))
      {
        ncharges = config.length;
        for (var i=0; i<ncharges; ++i)
        {
          charge = this.chargeBuilder(config[i]);
          // Only add the charge if chargeBuilder returns a non null result.
          if (!!charge)
          {
            charges.addCharge(charge);
          }
        }
      }
      else
      {
        charge = this.chargeBuilder(config);
        // Only add the charge if chargeBuilder returns a non null result.
        if (!!charge)
        {
          charges.addCharge(charge);
        }
      }
    }
    return charges;
  }

  // ======================================================
  // Charge Distribution Builders
  // ======================================================

  /**
   * Pull out elements from a charged plane configuration and
   * construct the corresponding charged plane.
   *
   * @param {object} config Has type "charged plane", with charge density
   *                 chargeDensity, field line density fieldLineDensity, and bounding box
   *                 {(x1, y1, z1), (x2, y2, z2), (x3, y3, z3), (x4, y4, z4)}.
   */
  this.chargedPlaneBuilder      = function(config)
  {
    var chargedPlane;
    var name;
    var chargeDensity;
    var fieldLineDensity;
    var x0, y0, z0;
    var x1, y1, z1;
    var x2, y2, z2;
    var x3, y3, z3;

    for (name in config)
    {
      if (name.match(chargeDensityRE))
      {
        chargeDensity = config[name];
      }
      else if (name.match(fieldLineDensityRE))
      {
        fieldLineDensity = config[name];
      }
      else if (name.toLowerCase() === "x0")
      {
        x0 = config[name];
      }
      else if (name.toLowerCase() === "y0")
      {
        y0 = config[name];
      }
      else if (name.toLowerCase() === "z0")
      {
        z0 = config[name];
      }
      else if (name.toLowerCase() === "x1")
      {
        x1 = config[name];
      }
      else if (name.toLowerCase() === "y1")
      {
        y1 = config[name];
      }
      else if (name.toLowerCase() === "z1")
      {
        z1 = config[name];
      }
      else if (name.toLowerCase() === "x2")
      {
        x2 = config[name];
      }
      else if (name.toLowerCase() === "y2")
      {
        y2 = config[name];
      }
      else if (name.toLowerCase() === "z2")
      {
        z2 = config[name];
      }
      else if (name.toLowerCase() === "x3")
      {
        x3 = config[name];
      }
      else if (name.toLowerCase() === "y3")
      {
        y3 = config[name];
      }
      else if (name.toLowerCase() === "z3")
      {
        z3 = config[name];
      }
    }

    chargedPlane = new ChargedPlane(chargeDensity,
                                    fieldLineDensity,
                                    x0, y0, z0,
                                    x1, y1, z1,
                                    x2, y2, z2,
                                    x3, y3, z3);

    return chargedPlane;
  }

  /**
   * Pull out the elements from a charged clylinder configuration object, and
   * construct the corresponding charged cylinder.
   *
   * @param {object} config has the type "charged cylinder" with charge density
   *                 chargeDensity, field line density fieldLineDensity, inner redius r0, and outer
   *                 radius r1. The section of the cylinder between (x0, y0, z0)
   *                 and (x1, y1, z1) is drawn.
   */
  this.chargedCylinderBuilder   = function(config)
  {
    var chargedCylinder;
    var name;
    // Charge density and field lines per unit charge.
    var chargeDensity, fieldLineDensity;
    // Center point of one end of the rendered section of an infinite cylinder.
    var x0, y0, z0;
    // The other end of the rendered section of the cylinder.
    var x1, y1, z1;
    // Inner and outer radii of the cylinder.
    var r0, r1;

    for (name in config)
    {
      if (name.match(chargeDensityRE))
      {
        chargeDensity = config[name];
      }
      else if (name.match(fieldLineDensityRE))
      {
        fieldLineDensity = config[name];
      }
      else if (name.toLowerCase() === "x0")
      {
        x0 = config[name];
      }
      else if (name.toLowerCase() === "y0")
      {
        y0 = config[name];
      }
      else if (name.toLowerCase() === "z0")
      {
        z0 = config[name];
      }
      else if (name.toLowerCase() === "x1")
      {
        x1 = config[name];
      }
      else if (name.toLowerCase() === "y1")
      {
        y1 = config[name];
      }
      else if (name.toLowerCase() === "z1")
      {
        z1 = config[name];
      }
      else if (name.toLowerCase() === "r0")
      {
        r0 = config[name];
      }
      else if (name.toLowerCase() === "r1")
      {
        r1 = config[name];
      }
    }

    chargedCylinder = new ChargedCylinder(x0, y0, z0, x1, y1, z1, r0, r1, chargeDensity, fieldLineDensity);

    return chargedCylinder;
  }

  this.chargedLineBuilder       = function(config)
  {
    var chargedLine;
    var name;
    var chargeDensity, fieldLineDensity;
    // Center point of one end of the rendered section of an infinite cylinder.
    var x0, y0, z0;
    // The other end of the rendered section of the cylinder.
    var x1, y1, z1;

    for (name in config)
    {
      if (name.match(chargeDensityRE))
      {
        chargeDensity = config[name];
      }
      else if (name.match(fieldLineDensityRE))
      {
        fieldLineDensity = config[name];
      }
      else if (name.toLowerCase() === "x0")
      {
        x0 = config[name];
      }
      else if (name.toLowerCase() === "y0")
      {
        y0 = config[name];
      }
      else if (name.toLowerCase() === "z0")
      {
        z0 = config[name];
      }
      else if (name.toLowerCase() === "x1")
      {
        x1 = config[name];
      }
      else if (name.toLowerCase() === "y1")
      {
        y1 = config[name];
      }
      else if (name.toLowerCase() === "z1")
      {
        z1 = config[name];
      }
    }

    chargedLine = new ChargedLine(x0, y0, z0, x1, y1, z1, chargeDensity, fieldLineDensity);

    return chargedLine;
  }

  this.chargedSphereBuilder      = function(config)
  {
    var chargedSphere;
    var charge;
    var fieldLineDensity;
    // The center of the sphere.
    var x, y, z;
    // The inner and outer radius.
    var a, b;

    for (name in config)
    {
      if (name.toLowerCase() === "charge")
      {
        charge = config[name];
      }
      else if (name.match(fieldLineDensityRE))
      {
        fieldLineDensity = config[name];
      }
      else if (name.toLowerCase() === "x")
      {
        x = config[name];
      }
      else if (name.toLowerCase() === "y")
      {
        y = config[name];
      }
      else if (name.toLowerCase() === "z")
      {
        z = config[name];
      }
      else if (name.toLowerCase() === "a")
      {
        a = config[name];
      }
      else if (name.toLowerCase() === "b")
      {
        b = config[name];
      }
    }

    chargedSphere = new ChargedSphere(charge, fieldLineDensity, x, y, z, a, b);

    return chargedSphere;
  }

  /**
   * Peek at the type of charge distribution, and dispatch the
   * config to the appropriate builder.
   */
  this.chargeDistributionBuilder = function(config)
  {
    var chargedCylinderRE;
    var chargedLineRE;
    var chargedPlaneRE;
    var chargedSphereRE;
    var distribution;
    var name;
    var type;

    chargedCylinderRE = /\s*charged\s*cylinder\s*/i;
    chargedLineRE     = /\s*charged\s*line\s*/i;
    chargedPlaneRE    = /\s*charged\s*plane\s*/i;
    chargedSphereRE   = /\s*charged\s*sphere\s*/i;

    for (name in config)
    {
      if(name.toLowerCase() === "type")
      {
        type = config[name];
        break;
      }
    }

    if (type.match(chargedPlaneRE))
    {
      distribution = this.chargedPlaneBuilder(config);
    }
    else if (type.match(chargedCylinderRE))
    {
      distribution = this.chargedCylinderBuilder(config);
    }
    else if (type.match(chargedLineRE))
    {
      distribution = this.chargedLineBuilder(config);
    }
    else if (type.match(chargedSphereRE))
    {
      distribution = this.chargedSphereBuilder(config);
    }

    return distribution;
  }

  /**
   * Build one or more charge distributions as defined in a
   * charge distribution attribute.
   * TODO: Repeated pattern, make use a pluggable strategy?
   */
  this.chargeDistributionsBuilder = function(config, charges)
  {
    var distribution;
    var ndistributions;

    if (!!config)
    {
      if (Array.isArray(config))
      {
        ndistributions = config.length;
        for (var i=0; i<ndistributions; ++i)
        {
          distribution = this.chargeDistributionBuilder(config[i]);
          // Only add the charge if chargeBuilder returns a non null result.
          if (!!distribution)
          {
            charges.addDistribution(distribution);
          }
        }
      }
      else
      {
        distribution = this.chargeDistributionBuilder(config);
        // Only add the charge if chargeBuilder returns a non null result.
        if (!!distribution)
        {
          charges.addDistribution(distribution);
        }
      }
    }
    return charges;
  }

  // ===================================================
  // Other, usually Gaussian, surfaces
  // ===================================================


  this.gaussianCylinderBuilder = function(config)
  {
    var gaussianCylinder;
    // The coordinates of the center of the cylinder
    var x, y, z;
    // Its height and radius.
    var h, r;
    // The angle of rotation about the y axis.
    var phi;
    // The angle of rotation about the z axis.
    var theta;

    for (name in config)
    {
      if (name.toLowerCase() === "x")
      {
        x = config[name];
      }
      else if (name.toLowerCase() === "y")
      {
        y = config[name];
      }
      else if (name.toLowerCase() === "z")
      {
        z = config[name];
      }
      else if (name.toLowerCase() === "h")
      {
        h = config[name];
      }
      else if (name.toLowerCase() === "r")
      {
        r = config[name];
      }
      else if (name.toLowerCase() === "phi")
      {
        phi = config[name];
      }
      else if (name.toLowerCase() === "theta")
      {
        theta = config[name];
      }
    }

    gaussianCylinder = new GaussianCylinder(x, y, z, h, r, phi, theta);

    return gaussianCylinder;
  }


  this.gaussianSphereBuilder = function(config)
  {
    var gaussianSphere;
    /** The coordinates of the center of the sphere. */
    var x, y, z;
    /** The radius of the sphere. */
    var r;

    for (name in config)
    {
      if (name.toLowerCase() === "x")
      {
        x = config[name];
      }
      else if (name.toLowerCase() === "y")
      {
        y = config[name];
      }
      else if (name.toLowerCase() === "z")
      {
        z = config[name];
      }
      else if (name.toLowerCase() === "r")
      {
        r = config[name];
      }
    }

    gaussianSphere = new GaussianSphere(x, y, z, r);

    return gaussianSphere;
  }

  /**
   * Build a single surface. Peek at the surface type and dispatch
   * the config to the appropriate builder.
   */
  this.surfaceBuilder       = function(config)
  {
    var gaussianCylinderRE;
    var gaussianSphereRE;
    var name;
    var surface;
    var type;

    gaussianCylinderRE = /\s*gaussian\s*cylinder\s*/i;
    gaussianSphereRE   = /\s*gaussian\s*sphere\s*/i;

    for (name in config)
    {
      if(name.toLowerCase() === "type")
      {
        type = config[name];
        break;
      }
    }

    if (type.match(gaussianCylinderRE))
    {
      surface = this.gaussianCylinderBuilder(config);
    }
    else if (type.match(gaussianSphereRE))
    {
      surface = this.gaussianSphereBuilder(config);
    }

    return surface;
  }

  /**
   * Build one or more surfaces according to whether the config is an
   * array or a single object. The renderer must have an addGaussianSurface
   * method.
   */
  this.surfacesBuilder      = function(config, renderer)
  {
    var surface;
    var nsurfaces;

    if (!!config)
    {
      if (Array.isArray(config))
      {
        nsurfaces = config.length;
        for (var i=0; i<nsurfaces; ++i)
        {
          surface = this.surfaceBuilder(config[i]);
          // Only add surface if surfaceBuilder was successful
          if (!!surface)
          {
            renderer.addGaussianSurface(surface);
          }
        }
      }
      else
      {
        surface = this.surfaceBuilder(config);
        // Only add surface if surfaceBuilder was successful
        if (!!surface)
        {
          renderer.addGaussianSurface(surface);
        }
      }
    }
    return renderer;
  }

  this.electricFieldBuilder = function(config)
  {
    var chargeDistributionRE;
    var drawingSurface, drawingSurfaceID;
    var charges, pointChargeConfig, distributedChargeConfig;
    var renderer;
    var surfaceConfig;
    var startPointsConfig;
    // Name and value of the properties on the config object.
    var name, value;

    chargeDistributionRE = /\s*charge\s*distribution\s*/i;
    charges = new Charges();

    for(var name in config)
    {
      if(name.toLowerCase() === "canvas")
      {
        drawingSurfaceID = config[name];
      }
      else if (name.toLowerCase() === "charges")
      {
        pointChargeConfig = config[name];
      }
      else if (name.toLowerCase() === "chargedistributions")
      {
        distributedChargeConfig = config[name]
      }
      else if (name.toLowerCase() ==="surfaces")
      {
        surfaceConfig = config[name];
      }
    }

    // If a canvas ID is defined
    if (!!drawingSurfaceID)
    {
      drawingSurface = document.getElementById(drawingSurfaceID);

      if (!!drawingSurface)
      {
        if (pointChargeConfig)
        {
          charges = this.chargesBuilder(pointChargeConfig, charges);
        }
        
        if(distributedChargeConfig)
        {
          charges = this.chargeDistributionsBuilder(distributedChargeConfig, charges);
        }
        renderer = new ElectricField(charges);
        renderer.setMaxVectors(30);
        renderer.setArrowSize(3.0);
        renderer.setArrowSpacing(30.0);
        renderer.addStartPoints(charges.getStartPoints(0, 5.0));

        if (surfaceConfig)
        {
          renderer = this.surfacesBuilder(surfaceConfig, renderer);
        }

        framework      = new FieldRenderer(drawingSurface, renderer);
        framework.setScale(120.0);

        framework.start();
      }
      else
      {
        alert("Can not find canvas with id=\"" + config.canvas + "\".");
      }
    }
    else
    {
      alert("No canvas specified for " + config.type + " visualization.");
    }
  }

  this.simpleVectorFieldBuilder = function(config)
  {
    var drawingSurface, drawingSurfaceID;
    var charges, pointChargeConfig, distributedChargeConfig;
    // An optional vector valued function.
    var field;
    var renderer;
    var startPointsConfig;
    // Name and value of the properties on the config object.
    var name, value;

    console.log("Simple Vector Field matched " + config.type);
  }

  /**
   * Process a single visualization configuration. Peek at the type of config,
   * and pass it on for processing as appropriate to its type.
   *
   * @param config An object with a type attribute naming the
   *               type of visualization being configured.
   */
  this.processConfig = function(config)
  {
    var electricFieldRE;
    /** Case insnesitive match of "simple vector field" with or without spaces. */
    var simpleVectorFieldRE;
    var type;

    electricFieldRE     = /\s*electric\s*field\s*/i;
    simpleVectorFieldRE = /\s*simple\s*vector\s*field\s*/i;

    /** Case insensitive match of "electric field" with or without spaces. */
    type = config.type;

    if(!type)
    {
      alert("Missing type for visualization configuration.");
    }
    else
    {
      if (type.match(electricFieldRE))
      {
        this.electricFieldBuilder(config);
      }
      else if (type.match(simpleVectorFieldRE))
      {
        this.simpleVectorFieldBuilder(config);
      }
      else
      {
        alert("Unrecognized visualization type: " + type + ".");
      }
    }
  }

  this.process = function(config)
  {
    var nvisualizations;

    if (config)
    {
      if (Array.isArray(config))
      {
        nvisualizations = config.length;
        for(var i=0; i<nvisualizations; ++i)
        {
          this.processConfig(config[i]);
        }
      }
      else
      {
        this.processConfig(config);
      }
    }
  }

  // Common RE's acros multiple methods.
  chargeDensityRE    = /\s*charge\s*density\s*/i;
  fieldLineDensityRE = /\s*field\s*line\s*density\s*/i;
  errorMessage       = "";
  warningMessage     = "";
}

/**
 * Invoked on DOM COntent Loaded, configs Vfield according to
 * VISUALIZATION_CONFIG if it exists.
 */
function VIZ_CONFIG_IF_EXISTS(event)
{
  var VIZ_CONFIG_PROCESSOR;

  if (VISUALIZATION_CONFIG)
  {
    VIZ_CONFIG_PROCESSOR = new VizBuilder();
    VIZ_CONFIG_PROCESSOR.process(VISUALIZATION_CONFIG);
  }
}

// These are possible states after DOMContentLoaded.
if (document.readyState === "interactive" || document.readyState === "complete")
{
  VIZ_CONFIG_IF_EXISTS();
}
else
{
  document.addEventListener("DOMContentLoaded", VIZ_CONFIG_IF_EXISTS);
}
