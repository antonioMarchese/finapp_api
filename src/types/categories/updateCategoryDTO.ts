import CreateCategoryDTO from './createCategoryDTO';

// Every field is optional so a single change (like the active switch) can be
// sent on its own.
type UpdateCategoryDTO = Partial<CreateCategoryDTO>;

export default UpdateCategoryDTO;
