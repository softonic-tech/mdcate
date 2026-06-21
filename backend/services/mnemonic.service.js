import Mnemonic from "../models/mnemonic.model.js";
import ApiError from "../utils/ApiError.js";

export const createMnemonic = (data) => Mnemonic.create(data);

export const getAllMnemonics = (filters = {}) => {
  const query = {};
  if (filters.subjectId) query.subjectId = filters.subjectId;
  return Mnemonic.find(query)
    .populate("subjectId", "name")
    .populate("createdBy", "username");
};

export const getMnemonicById = async (id) => {
  const m = await Mnemonic.findById(id).populate("subjectId", "name");
  if (!m) throw ApiError.notFound("Mnemonic not found");
  return m;
};

export const updateMnemonic = async (id, data) => {
  const m = await Mnemonic.findByIdAndUpdate(id, data, { new: true });
  if (!m) throw ApiError.notFound("Mnemonic not found");
  return m;
};

export const deleteMnemonic = async (id) => {
  const m = await Mnemonic.findByIdAndDelete(id);
  if (!m) throw ApiError.notFound("Mnemonic not found");
};
