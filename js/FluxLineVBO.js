/**
 * Container for the line and direction indicators for a flux line.
 * NOTE: Consider combining these into a single VBO.
 */
function FluxLineVBO(glUtility, fluxLine)
{
  var fluxDirectionBufferHandle;

  this.fluxLineBufferHandle      = glUtility.createBuffer(fluxLine.getPoints());
  this.npoints                   = fluxLine.getNpoints();
  this.fluxDirectionBufferHandle = glUtility.createBuffer(fluxLine.getArrows());
  this.narrows                   = fluxLine.getNarrows();
}