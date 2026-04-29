import * as retentionCallModel from "./retention-calls.model.js";

function isValidTimestamp(value) {
  return !Number.isNaN(new Date(value).getTime());
}

async function getRetentionCallsForCustomer(req, res, next) {
  try {
    const customerId = Number(req.params.customerId);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ message: "Invalid customer id" });
    }

    const calls =
      await retentionCallModel.getRetentionCallsForCustomer(customerId);

    res.json(calls);
  } catch (error) {
    next(error);
  }
}

async function createRetentionCall(req, res, next) {
  try {
    const {
      customer_id: customerId,
      call_timestamp: callTimestamp,
      outcome,
      notes,
    } = req.body;

    if (!Number.isInteger(Number(customerId)) || Number(customerId) <= 0) {
      return res
        .status(400)
        .json({ message: "customer_id must be a positive integer" });
    }

    if (typeof outcome !== "string" || outcome.trim() === "") {
      return res.status(400).json({ message: "outcome is required" });
    }

    if (callTimestamp && !isValidTimestamp(callTimestamp)) {
      return res
        .status(400)
        .json({ message: "call_timestamp must be a valid date" });
    }

    if (notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({ message: "notes must be a string" });
    }

    const retentionCall = await retentionCallModel.createRetentionCall({
      customerId: Number(customerId),
      callTimestamp,
      outcome: outcome.trim(),
      notes,
    });

    res.status(201).json(retentionCall);
  } catch (error) {
    next(error);
  }
}

export { getRetentionCallsForCustomer, createRetentionCall };
