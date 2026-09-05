'use strict';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
  }
}

/**
 * Validates the full AI_Response schema.
 *
 * @param {*} data - Parsed JSON object to validate
 * @returns {object} The validated data (same reference)
 * @throws {ValidationError} If any field fails validation
 */
function validateAIResponse(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Response must be a JSON object');
  }

  // ── analogyTitle ─────────────────────────────────────────────────────────
  if (typeof data.analogyTitle !== 'string' || data.analogyTitle.trim() === '') {
    throw new ValidationError('analogyTitle must be a non-empty string');
  }

  // ── nodes ─────────────────────────────────────────────────────────────────
  if (!Array.isArray(data.nodes)) {
    throw new ValidationError('nodes must be an array');
  }
  if (data.nodes.length < 3 || data.nodes.length > 20) {
    throw new ValidationError(`nodes count must be between 3 and 20 (got ${data.nodes.length})`);
  }

  const nodeIds = new Set();
  for (let i = 0; i < data.nodes.length; i++) {
    const node = data.nodes[i];
    if (node === null || typeof node !== 'object') {
      throw new ValidationError(`nodes[${i}] must be an object`);
    }
    if (typeof node.id !== 'string' || node.id.trim() === '') {
      throw new ValidationError(`nodes[${i}].id must be a non-empty string`);
    }
    if (typeof node.conceptLabel !== 'string' || node.conceptLabel.trim() === '') {
      throw new ValidationError(`nodes[${i}].conceptLabel must be a non-empty string`);
    }
    if (typeof node.analogyLabel !== 'string' || node.analogyLabel.trim() === '') {
      throw new ValidationError(`nodes[${i}].analogyLabel must be a non-empty string`);
    }
    nodeIds.add(node.id);
  }

  // ── mappings ──────────────────────────────────────────────────────────────
  if (!Array.isArray(data.mappings) || data.mappings.length === 0) {
    throw new ValidationError('mappings must be a non-empty array');
  }
  for (let i = 0; i < data.mappings.length; i++) {
    const mapping = data.mappings[i];
    if (mapping === null || typeof mapping !== 'object') {
      throw new ValidationError(`mappings[${i}] must be an object`);
    }
    if (typeof mapping.conceptComponent !== 'string' || mapping.conceptComponent.trim() === '') {
      throw new ValidationError(`mappings[${i}].conceptComponent must be a non-empty string`);
    }
    if (typeof mapping.analogyElement !== 'string' || mapping.analogyElement.trim() === '') {
      throw new ValidationError(`mappings[${i}].analogyElement must be a non-empty string`);
    }
    if (typeof mapping.mappingLabel !== 'string' || mapping.mappingLabel.trim() === '') {
      throw new ValidationError(`mappings[${i}].mappingLabel must be a non-empty string`);
    }
  }

  // ── relationships ─────────────────────────────────────────────────────────
  if (!Array.isArray(data.relationships)) {
    throw new ValidationError('relationships must be an array');
  }
  for (let i = 0; i < data.relationships.length; i++) {
    const rel = data.relationships[i];
    if (rel === null || typeof rel !== 'object') {
      throw new ValidationError(`relationships[${i}] must be an object`);
    }
    if (typeof rel.sourceId !== 'string' || rel.sourceId.trim() === '') {
      throw new ValidationError(`relationships[${i}].sourceId must be a non-empty string`);
    }
    if (typeof rel.targetId !== 'string' || rel.targetId.trim() === '') {
      throw new ValidationError(`relationships[${i}].targetId must be a non-empty string`);
    }
    // Self-loops are not allowed
    if (rel.sourceId === rel.targetId) {
      throw new ValidationError(
        `relationships[${i}] has a self-loop (sourceId === targetId: "${rel.sourceId}")`
      );
    }
    // Referential integrity — both IDs must exist in nodes
    if (!nodeIds.has(rel.sourceId)) {
      throw new ValidationError(
        `relationships[${i}].sourceId "${rel.sourceId}" does not reference an existing node`
      );
    }
    if (!nodeIds.has(rel.targetId)) {
      throw new ValidationError(
        `relationships[${i}].targetId "${rel.targetId}" does not reference an existing node`
      );
    }
    // label: if present and not null, must be a string
    if (rel.label !== undefined && rel.label !== null && typeof rel.label !== 'string') {
      throw new ValidationError(`relationships[${i}].label must be a string or null`);
    }
    // flow: if present, must be a boolean
    if (rel.flow !== undefined && typeof rel.flow !== 'boolean') {
      throw new ValidationError(`relationships[${i}].flow must be a boolean`);
    }
  }

  // ── explanation ───────────────────────────────────────────────────────────
  if (typeof data.explanation !== 'string' || data.explanation.trim() === '') {
    throw new ValidationError('explanation must be a non-empty string');
  }

  // ── limitations ───────────────────────────────────────────────────────────
  if (!Array.isArray(data.limitations)) {
    throw new ValidationError('limitations must be an array');
  }
  if (data.limitations.length < 1 || data.limitations.length > 10) {
    throw new ValidationError(
      `limitations count must be between 1 and 10 (got ${data.limitations.length})`
    );
  }
  for (let i = 0; i < data.limitations.length; i++) {
    if (typeof data.limitations[i] !== 'string' || data.limitations[i].trim() === '') {
      throw new ValidationError(`limitations[${i}] must be a non-empty string`);
    }
  }

  return data;
}

module.exports = { validateAIResponse, ValidationError };
