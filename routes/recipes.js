var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path is for searching a recipe
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipeName = req.query.recipeName;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;  
    const intolerance = req.query.intolerance;
    const number = req.query.number || 5;
    console.log("here in get /search router in recipes.js")
    const results = await recipes_utils.searchRecipe(recipeName, cuisine, diet, intolerance, number);
    res.send(results);
  } catch (error) {
    next(error);
  }
})

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/fullview/:recipeId", async (req, res, next) => {
  try {
    console.log("here in fullview:recipeId in recipes.js")
    // the problem is that 'req.params.recipeId' not using the 'map' function, need to fix this
    const recipe = await recipes_utils.getRecipeFullviewDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns only a preview of a recipe by its id
 */
router.get("/preview/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

module.exports = router;