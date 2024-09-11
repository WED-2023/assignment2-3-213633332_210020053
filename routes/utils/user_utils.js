const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function createRecipe(user_id,recipe_details){
    const likes = 0;  // Default value for likes

    const query = `
        INSERT INTO recipes (
            user_id, title, ingredients, instructions, servings, time, likes, vegan, gluten_free, vegetarian, image
        ) VALUES (
            ${user_id}, '${recipe_details.title}', '${recipe_details.ingredients}', '${recipe_details.instructions}', ${recipe_details.servings}, ${recipe_details.time}, ${likes}, ${recipe_details.vegan}, ${recipe_details.glutenFree}, ${recipe_details.vegetarian}, '${recipe_details.image}'
        )
    `;

    await DButils.execQuery(query);
}


async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getCreatedRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from recipes where user_id='${user_id}'`);
    return recipes_id;
}

exports.getCreatedRecipes = getCreatedRecipes
exports.createRecipe = createRecipe
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
