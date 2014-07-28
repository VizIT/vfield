/**
 * Container for the line and direction indicators for a field line.
 * NOTE: Consider combining these into a single VBO.
 */
function FieldLineVBO(glUtility, fieldLine)
{
  this.fieldLineBufferHandle      = glUtility.createBuffer(fieldLine.getPoints());
  this.npoints                    = fieldLine.getNpoints();
  this.fieldDirectionBufferHandle = glUtility.createBuffer(fieldLine.getArrows());
  this.narrows                    = fieldLine.getNarrows();
}