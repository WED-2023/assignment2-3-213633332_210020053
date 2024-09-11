var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
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
    console.log("we found: "+recipes_id)
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    console.log("we found2: "+recipes_id_array)
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    console.log("we have: "+results)
    console.log("we have2: " + JSON.stringify(results, null, 2));
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

router.post("/createRecipe", async (req, res, next) => {
  try {
    const user_id = req.user_id; // Assuming user_id is retrieved from session or JWT token
    const {
      title,
      image,
      summary,
      extendedIngredients,
      instructions,
      servings,
      readyInMinutes,
      vegetarian,
      vegan,
      glutenFree,
    } = req.body;

    // Convert extendedIngredients to a string (JSON) for storage
    const ingredients = JSON.stringify(extendedIngredients);

    
    await DButils.execQuery(
      `INSERT INTO recipes (user_id, title, ingredients, instructions, servings, time, vegan, gluten_free, vegetarian, image, likes) 
       VALUES (${user_id}, '${title}', '${ingredients}', '${instructions}', ${servings}, ${readyInMinutes}, 
       ${vegan === "Yes" ? 1 : 0}, ${glutenFree === "Yes" ? 1 : 0}, ${vegetarian === "Yes" ? 1 : 0}, '${image}', 0)`
    );

    res.status(201).send({ message: "Recipe created successfully", success: true });
  } catch (error) {
    next(error);
  }
});


router.get('/created/fullView/:userId/:recipeId', async (req, res, next) => {
  try {
    const user_id = req.params.userId;  // Access userId from the URL parameters
    const recipe_id = req.params.recipeId; // Access recipeId from the URL parameters
    const results = await recipe_utils.getRecipeInformationFromDb(recipe_id);
    res.status(200).send(results);
  } catch (error) {
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
