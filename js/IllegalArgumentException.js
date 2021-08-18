/**
 * Thrown when an argument passed to a method violates the expected constraints.
 */
class IllegalArgumentException extends Error {
    /**
     * Build a class indicating we were passed an unacceptable value.
     * @param {string} message Provide some information about the constraint that was validated.
     */
    constructor(message) {
        super(message);
        this.name = "IllegalArgumentException";
    }
}