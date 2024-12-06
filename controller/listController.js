import List from "../models/List";
import User from "../models/User";

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
    const description = req.body.description;
    const userId = req.body.userId;
    
    if(!userId){
      return res.status(400).json({message: "User ID is required"});
    }
    
    if (!name) {
      return res.status(400).json({ message: "A list need a name!" });
    }

    if(!description){
      req.body.description = "No description"
    }

    const newList = await List.create({ 
      name: name, 
      description: req.body.description,
      userId: userId 
    });

    const populatedList = await List.findById(newList._id).populate('userId');
    await User.findByIdAndUpdate(userId, { $push: { list: newList._id } });

    res.status(200).json({ message: "List created!", populatedList: populatedList });
  } catch (error) {
    next(error);
  }
};

export const updateList = async (req, res, next) => {
  try {
    const { name, _id, description } = req.body;

    const updateList = await List.findById(_id);

    if (!updateList) {
      return res.status(404).json({ message: "List not found!" });
    }
    
    if (description) {
      updateList.description = description.trim();
    }

    if (name) {
      updateList.name = name;
    }

    await updateList.save();

    res.status(200).json({ message: "List updated!", name: updateList });
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
