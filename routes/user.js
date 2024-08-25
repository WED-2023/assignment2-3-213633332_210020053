var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  console.log("req session and user_id", req.session,req.session.user_id);
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});
router.post('/createRecipe', async (req,res,next) => {
  try{
    const user_id = req.session.user_id
    let recipe_details = {
      title: req.body.title,
      time: req.body.readyInMinutes,
      image: req.body.image,
      popularity: req.body.aggregateLikes,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      glutenFree: req.body.glutenFree,
      servings: req.body.servings,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions
    }
    await user_utils.createRecipe(user_id,recipe_details);
    res.status(200).send("The Recipe successfully saved as created");
    } catch(error){
    next(error);
  }
})
//
router.get('/created/fullView:userId:recipeId', async (req,res,next) => {//make sure /created/fullView:userId:recipeId is valid
  try{
    const user_id = req.session.user_id;
    let recipe_id = req.body.recipe_id;
    const results = await recipe_utils.getRecipeInformationFromDb(recipe_id);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});
router.get('/created/preView:userId', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getCreatedRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreviewFromDb(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});




module.exports = router;
