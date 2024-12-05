import List from "../models/List";

export const allLists = async (req, res, next) => {
  try {
    res.status(200).json(await List.find());
  } catch (error) {
    next(error);
  }
};

export const createList = async (req, res, next) => {
  try {
    const name = req.body.name.trim();
    if (!name) {
      return res.status(400).json({ message: "A list need a name!" });
    }

    const newList = await List.create({ name });
    res.status(200).json({ message: "List created!", name: newList });
  } catch (error) {
    next(error);
  }
};

export const updateList = async (req, res, next) => {
  try {
    const id = req.body._id;
    const name = req.body.name.trim();
    const updatedList = await List.findByIdAndUpdate({ _id: id, name: name });
    res.status(200).json({ message: "List-name updated!", name: updatedList });
  } catch (error) {
    next(error);
  }
};

export const deleteList = async (req, res, next) => {
  console.log("test");
  try {
    const id = req.body._id;
    const deletedList = await List.findByIdAndDelete({ _id: id });

    if(!await List.findById({_id: id})){
        return res.status(404).json({ message: "List not found!" });
    }
    res.status(200).json({ message: "List deleted!", name: deletedList });
  } catch (error) {
    next(error);
  }
};
