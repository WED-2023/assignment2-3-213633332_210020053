const axios = require("axios");
const { query } = require("express");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, serving, ingredients } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        serving: serving,
        ingredients: ingredients,
        
    }
}

async function searchRecipe(recipeName, cuisine, diet, intolerance, number, username) {
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: recipeName,
            cuisine: cuisine,
            diet: diet,
            intolerances: intolerance,
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    });
    console.log("recipeName : " + recipeName + " cuisine : " + cuisine +
       " diet : " + diet + " intolerance : " + intolerance + " number : " + number + " username : " + username)
    console.log("here in search recipe function in recipes_utils.js");
    console.log(response.data.results.map((element) => element.id), username);


    return getRecipesPreview(response.data.results.map((element) => element.id), username);
}



exports.getRecipeDetails = getRecipeDetails;


// the following code was written by me - Idan :

function extractPreviewRecipeDetails(recipes_info) {
  return recipes_info.map((recipe_info) => {
      //check the data type so it can work with diffrent types of data
      let data = recipe_info;
      if (recipe_info.data) {
          data = recipe_info.data;
      }
      const {
          id,
          title,
          readyInMinutes,
          image,
          aggregateLikes,
          vegan,
          vegetarian,
          glutenFree
      } = data;
      return {
          id: id,
          title: title,
          image: image,
          readyInMinutes: readyInMinutes,
          popularity: aggregateLikes,
          vegan: vegan,
          vegetarian: vegetarian,
          glutenFree: glutenFree
      }
  })
}

// We might not really need this function - possibly can be deleted.

// function extractFullviewRecipeDetails(recipes_info) {
//     return recipes_info.map((recipe_info) => {
//         //check the data type so it can work with diffrent types of data
//         let data = recipe_info;
//         if (recipe_info.data) {
//             data = recipe_info.data;
//         }
//         const {
//             id,
//             title,
//             readyInMinutes,
//             image,
//             aggregateLikes,
//             vegan,
//             vegetarian,
//             glutenFree,
//             serving,
//             instructions,
//             extendedIngredients
//         } = data;
//         return {
//             id: id,
//             title: title,
//             image: image,
//             readyInMinutes: readyInMinutes,
//             popularity: aggregateLikes,
//             vegan: vegan,
//             vegetarian: vegetarian,
//             glutenFree: glutenFree,
//             serving: serving,
//             instructions: instructions,
//             extendedIngredients: extendedIngredients
//         }
//     })
//   }
  


async function getRecipesPreview(recipes_ids_list) {
  let promises = [];
  recipes_ids_list.map((id) => {
      promises.push(getRecipeInformation(id));
  });
  let info_res = await Promise.all(promises);
  //info_res.map((recp)=>{console.log(recp.data)});
  info_res = extractPreviewRecipeDetails(info_res);
  console.log(info_res);
  return info_res
}

// async function getRecipesFullview(recipes_ids_list) {
//     let promises = [];
//     recipes_ids_list.map((id) => {
//         promises.push(getRecipeInformation(id));
//     });
//     let info_res = await Promise.all(promises);
//     info_res.map((recp)=>{console.log(recp.data)});
//     info_res = extractFullviewRecipeDetails(info_res);
//     console.log(info_res);
//     return info_res
//   }

async function getRecipeFullviewDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, serving, ingredients, instructions, extendedIngredients } = recipe_info.data;

    // Map over the extendedIngredients to get the required fields
    let simplifiedIngredients = extendedIngredients.map(ingredient => ({
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit
    }));

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        serving: serving,
        ingredients: ingredients,
        instructions: instructions,
        extendedIngredients: simplifiedIngredients
    };
}


//getRecipesPreview(["663559","642582","655705","652100"]);
//getRecipesPreview(["663559","642582"]);

// Add this line to export the new function
exports.getRecipesPreview = getRecipesPreview;

// Existing exports
exports.getRecipeDetails = getRecipeDetails;
exports.searchRecipe = searchRecipe;
exports.extractPreviewRecipeDetails = extractPreviewRecipeDetails;
//exports.getRecipesFullview = getRecipesFullview;
exports.getRecipeFullviewDetails = getRecipeFullviewDetails;