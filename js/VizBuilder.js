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
 * TODO Break up into smaller classes?
 *
 * @class
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
    /** The name of this element */
    var name;
    // Magnitude of the charge
    var q;
    // Position of the charge
    var x, y, z;
    // number of field lines per unit charge, or the number of field lines.
    var rho, nlines;
    // Name and value of the properties on the config object.
    var property, value;

    // We know in what follows that this is a string.
    message = "";

    // Reasonable becaue this is a small object with few properties.
    for(var property in config)
    {
      if(property.toLowerCase() === "q")
      {
        q = config[property];
      }
      else if (property.toLowerCase() === "x")
      {
        x = config[property];
      }
      else if (property.toLowerCase() === "y")
      {
        y = config[property];
      }
      else if (property.toLowerCase() === "z")
      {
        z = config[property];
      }
      else if (property.toLowerCase() === "rho")
      {
        rho = config[property];
      }
      else if (property.toLowerCase() === "nlines")
      {
        nlines = config[property];
      }
      else if (property.toLowerCase() === "name")
      {
        name = config[property];
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
	charge = new Charge(q, x, y, z, rho, name);
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
  this.chargesBuilder = function(config, charges, framework)
  {
    var charge;
    var name;
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
            name = charge.getName();
            if (name)
            {
              framework.setElementName(charge, name)
            }
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
            name = charge.getName();
            if (name)
            {
              framework.setElementName(charge, name)
            }
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
    var property;
    var chargeDensity;
    var fieldLineDensity;
    /** The name of this element */
    var name;
    var x0, y0, z0;
    var x1, y1, z1;
    var x2, y2, z2;
    var x3, y3, z3;

    for (property in config)
    {
      if (property.match(chargeDensityRE))
      {
        chargeDensity = config[property];
      }
      else if (property.match(fieldLineDensityRE))
      {
        fieldLineDensity = config[property];
      }
      else if (property.toLowerCase() === "x0")
      {
        x0 = config[property];
      }
      else if (property.toLowerCase() === "y0")
      {
        y0 = config[property];
      }
      else if (property.toLowerCase() === "z0")
      {
        z0 = config[property];
      }
      else if (property.toLowerCase() === "x1")
      {
        x1 = config[property];
      }
      else if (property.toLowerCase() === "y1")
      {
        y1 = config[property];
      }
      else if (property.toLowerCase() === "z1")
      {
        z1 = config[property];
      }
      else if (property.toLowerCase() === "x2")
      {
        x2 = config[property];
      }
      else if (property.toLowerCase() === "y2")
      {
        y2 = config[property];
      }
      else if (property.toLowerCase() === "z2")
      {
        z2 = config[property];
      }
      else if (property.toLowerCase() === "x3")
      {
        x3 = config[property];
      }
      else if (property.toLowerCase() === "y3")
      {
        y3 = config[property];
      }
      else if (property.toLowerCase() === "z3")
      {
        z3 = config[property];
      }
      else if (property.toLowerCase() === "name")
      {
        name = config[property];
      }
    }

    chargedPlane = new ChargedPlane(chargeDensity,
                                    fieldLineDensity,
                                    x0, y0, z0,
                                    x1, y1, z1,
                                    x2, y2, z2,
                                    x3, y3, z3,
                                    name);

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
    var property;
    // Charge density and field lines per unit charge.
    var chargeDensity, fieldLineDensity;
    /** The name of this element */
    var name;
    // Center point of one end of the rendered section of an infinite cylinder.
    var x0, y0, z0;
    // The other end of the rendered section of the cylinder.
    var x1, y1, z1;
    // Inner and outer radii of the cylinder.
    var r0, r1;

    for (property in config)
    {
      if (property.match(chargeDensityRE))
      {
        chargeDensity = config[property];
      }
      else if (property.match(fieldLineDensityRE))
      {
        fieldLineDensity = config[property];
      }
      else if (property.toLowerCase() === "x0")
      {
        x0 = config[property];
      }
      else if (property.toLowerCase() === "y0")
      {
        y0 = config[property];
      }
      else if (property.toLowerCase() === "z0")
      {
        z0 = config[property];
      }
      else if (property.toLowerCase() === "x1")
      {
        x1 = config[property];
      }
      else if (property.toLowerCase() === "y1")
      {
        y1 = config[property];
      }
      else if (property.toLowerCase() === "z1")
      {
        z1 = config[property];
      }
      else if (property.toLowerCase() === "r0")
      {
        r0 = config[property];
      }
      else if (property.toLowerCase() === "r1")
      {
        r1 = config[property];
      }
      else if (property.toLowerCase() === "name")
      {
        name = config[property];
      }
    }

    chargedCylinder = new ChargedCylinder(x0, y0, z0,
                                          x1, y1, z1,
                                          r0, r1,
                                          chargeDensity,
                                          fieldLineDensity,
                                          name);

    return chargedCylinder;
  }

  this.chargedLineBuilder       = function(config)
  {
    var chargedLine;
    var property;
    var chargeDensity, fieldLineDensity;
    /** The name of this element */
    var name;
    // Center point of one end of the rendered section of an infinite cylinder.
    var x0, y0, z0;
    // The other end of the rendered section of the cylinder.
    var x1, y1, z1;

    for (property in config)
    {
      if (property.match(chargeDensityRE))
      {
        chargeDensity = config[property];
      }
      else if (property.match(fieldLineDensityRE))
      {
        fieldLineDensity = config[property];
      }
      else if (property.toLowerCase() === "x0")
      {
        x0 = config[property];
      }
      else if (property.toLowerCase() === "y0")
      {
        y0 = config[property];
      }
      else if (property.toLowerCase() === "z0")
      {
        z0 = config[property];
      }
      else if (property.toLowerCase() === "x1")
      {
        x1 = config[property];
      }
      else if (property.toLowerCase() === "y1")
      {
        y1 = config[property];
      }
      else if (property.toLowerCase() === "z1")
      {
        z1 = config[property];
      }
      else if (property.toLowerCase() === "name")
      {
        name = config[property];
      }
    }

    chargedLine = new ChargedLine(x0, y0, z0,
                                  x1, y1, z1,
                                  chargeDensity,
                                  fieldLineDensity,
                                  name);

    return chargedLine;
  }

  this.chargedSphereBuilder      = function(config)
  {
    var chargedSphere;
    var charge;
    var fieldLineDensity;
    /** The name of this element */
    var name;
    // The center of the sphere.
    var x, y, z;
    // The inner and outer radius.
    var a, b;

    for (property in config)
    {
      if (property.toLowerCase() === "charge")
      {
        charge = config[property];
      }
      else if (property.match(fieldLineDensityRE))
      {
        fieldLineDensity = config[property];
      }
      else if (property.toLowerCase() === "x")
      {
        x = config[property];
      }
      else if (property.toLowerCase() === "y")
      {
        y = config[property];
      }
      else if (property.toLowerCase() === "z")
      {
        z = config[property];
      }
      else if (property.toLowerCase() === "a")
      {
        a = config[property];
      }
      else if (property.toLowerCase() === "b")
      {
        b = config[property];
      }
      else if (property.toLowerCase() === "name")
      {
        name = config[property];
      }
    }

    chargedSphere = new ChargedSphere(charge,
                                      fieldLineDensity,
                                      x, y, z,
                                      a, b,
                                      name);

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
    var property;
    var type;

    chargedCylinderRE = /\s*charged\s*cylinder\s*/i;
    chargedLineRE     = /\s*charged\s*line\s*/i;
    chargedPlaneRE    = /\s*charged\s*plane\s*/i;
    chargedSphereRE   = /\s*charged\s*sphere\s*/i;

    for (property in config)
    {
      if(property.toLowerCase() === "type")
      {
        type = config[property];
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
  this.chargeDistributionsBuilder = function(config, charges, framework)
  {
    var distribution;
    var name;
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
            name = distribution.getName();
            if (name)
            {
              framework.setElementName(distribution, name)
            }
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
          name = distribution.getName();
          if (name)
          {
            framework.setElementName(distribution, name)
          }
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
    /** The name of this element */
    var name;
    var property;
    // The coordinates of the center of the cylinder
    var x, y, z;
    // Its height and radius.
    var h, r;
    // The angle of rotation about the y axis.
    var phi;
    // The angle of rotation about the z axis.
    var theta;

    for (property in config)
    {
      if (property.toLowerCase() === "x")
      {
        x = config[property];
      }
      else if (property.toLowerCase() === "y")
      {
        y = config[property];
      }
      else if (property.toLowerCase() === "z")
      {
        z = config[property];
      }
      else if (property.toLowerCase() === "h")
      {
        h = config[property];
      }
      else if (property.toLowerCase() === "r")
      {
        r = config[property];
      }
      else if (property.toLowerCase() === "phi")
      {
        phi = config[property];
      }
      else if (property.toLowerCase() === "theta")
      {
        theta = config[property];
      }
      else if (property.toLowerCase() === "name")
      {
        name = config[property];
      }
    }

    gaussianCylinder = new GaussianCylinder(x, y, z,
                                            h, r,
                                            phi, theta,
                                            name);

    return gaussianCylinder;
  }


  this.gaussianSphereBuilder = function(config)
  {
    var gaussianSphere;
    var name;
    var property;
    /** The coordinates of the center of the sphere. */
    var x, y, z;
    /** The radius of the sphere. */
    var r;

    for (property in config)
    {
      if (property.toLowerCase() === "x")
      {
        x = config[property];
      }
      else if (property.toLowerCase() === "y")
      {
        y = config[property];
      }
      else if (property.toLowerCase() === "z")
      {
        z = config[property];
      }
      else if (property.toLowerCase() === "r")
      {
        r = config[property];
      }
      else if (property.toLowerCase() === "name")
      {
        name = config[property];
      }
    }

    gaussianSphere = new GaussianSphere(x, y, z, r, name);

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
    var property;
    var surface;
    var type;

    gaussianCylinderRE = /\s*gaussian\s*cylinder\s*/i;
    gaussianSphereRE   = /\s*gaussian\s*sphere\s*/i;

    for (property in config)
    {
      if(property.toLowerCase() === "type")
      {
        type = config[property];
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
  this.surfacesBuilder      = function(config, renderer, framework)
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
          surface = this.surfaceBuilder(config[i], framework);
          // Only add surface if surfaceBuilder was successful
          if (!!surface)
          {
            renderer.addGaussianSurface(surface);
            name = surface.getName();
            if (name)
            {
              framework.setElementName(surface, name)
            }
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
          name = surface.getName();
          if (name)
          {
            // TODO Error handling if name already defined.
            framework.setElementName(surface, name)
          }
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
    var framework;
    var renderer;
    var surfaceConfig;
    var startPointsConfig;
    // Name and value of the properties on the config object.
    var property, value;

    chargeDistributionRE = /\s*charge\s*distribution\s*/i;
    charges = new Charges();

    for(var property in config)
    {
      if(property.toLowerCase() === "canvas")
      {
        drawingSurfaceID = config[property];
      }
      else if (property.toLowerCase() === "charges")
      {
        pointChargeConfig = config[property];
      }
      else if (property.toLowerCase() === "chargedistributions")
      {
        distributedChargeConfig = config[property]
      }
      else if (property.toLowerCase() ==="surfaces")
      {
        surfaceConfig = config[property];
      }
    }

    // If a canvas ID is defined
    if (!!drawingSurfaceID)
    {
      drawingSurface = document.getElementById(drawingSurfaceID);

      if (!!drawingSurface)
      {
        framework = new FieldRenderer(drawingSurface);
        if (pointChargeConfig)
        {
          charges = this.chargesBuilder(pointChargeConfig, charges, framework);
        }
        
        if(distributedChargeConfig)
        {
          charges = this.chargeDistributionsBuilder(distributedChargeConfig, charges, framework);
        }
        renderer = new ElectricField(charges);
        renderer.setMaxVectors(30);
        renderer.setArrowSize(3.0);
        renderer.setArrowSpacing(30.0);
        renderer.addStartPoints(charges.getStartPoints(0, 5.0));

        if (surfaceConfig)
        {
	    renderer = this.surfacesBuilder(surfaceConfig, renderer, framework);
        }

        framework.setRenderer(renderer);
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
    var property, value;

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
