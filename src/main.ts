import './style.css';
import { IPokemon, IPokemonList, IResult } from './interfaces/IPokemon';

const BASE_URL = "https://pokeapi.co/api/v2/";

//* ------------------------ Selecting HTML elements ------------------------
const displayCardsWrapper = document.querySelector('#display__cards__wrapper') as HTMLDivElement;
const typeButtons = document.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
const searchInput = document.querySelector('#search__input') as HTMLInputElement;
const nextButtons = document.querySelectorAll('.next') as NodeListOf<HTMLButtonElement>;
const prevButtons = document.querySelectorAll('.prev') as NodeListOf<HTMLButtonElement>;

//* ------------------------ Saveing fecth data ------------------------
let pokemonArr: string[] = []; 
let pokemonDataArr: IPokemon[] = []; 

//* ------------------------ Paging settings ------------------------
let currentPage = 0;
const limit = 20;

//* ------------------------ Declaring functions ------------------------
async function fetchAllPokemon(offset: number = 0, limit: number = 20): Promise<void> {
    try {
        const url = `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`;
        const response = await fetch(url);
        const result = await response.json() as IPokemonList;
        const pokemonURLArr = result.results.map((pokemon: IResult) => pokemon.url);
        pokemonArr = [...pokemonURLArr];
    } catch (err) {
        console.error(err);
    }
}

async function fetchSinglePokemon(url: string): Promise<void> {
    try {
        const response = await fetch(url);
        const pokemon = await response.json() as IPokemon;
        pokemonDataArr.push(pokemon);
    } catch (err) {
        console.error(err);
    }
}

async function displayCard(pokemon: IPokemon): Promise<void> {
    displayCardsWrapper.innerHTML += `
        <div class="poke_card">
            <div>
                <div class="poke_name_id">
                    <p>#${pokemon.id.toString().padStart(3, '0')}</p>
                    <p>${pokemon.name}</p>
                </div>
                <img src="${pokemon.sprites.other.dream_world.front_default}" />
                ${matchBtnToType(pokemon)}
            </div>
        </div>
    `;
}

function matchBtnToType(pokemon: IPokemon): string {
    const result = pokemon.types.map((types) => types.type.name);
    return result.map((type) => `<button class="${type}">${type}</button>`).join('');
}

async function loadPage(): Promise<void> {
    displayCardsWrapper.innerHTML = ''; 
    pokemonDataArr = []; 

    const offset = currentPage * limit;
    await fetchAllPokemon(offset, limit);
    await Promise.all(pokemonArr.map(async (url) => await fetchSinglePokemon(url)));

    pokemonDataArr.sort((a: IPokemon, b: IPokemon) => a.id - b.id).forEach(async (pokemon) => await displayCard(pokemon));
}

//* ------------------------ Fetch Pokémon by Type ------------------------

async function fetchPokemonByType(type: string): Promise<void> {
    try {
        displayCardsWrapper.innerHTML = '';
        pokemonDataArr = [];

        const url = `${BASE_URL}/type/${type}`;
        const response = await fetch(url);
        const result = await response.json();

        const pokemonURLArr = result.pokemon.map((p: { pokemon: { url: string } }) => p.pokemon.url);
        const limitedURLs = pokemonURLArr.slice(0, 50);

        await Promise.all(limitedURLs.map(async (url: string) => await fetchSinglePokemon(url)));
        pokemonDataArr.sort((a: IPokemon, b: IPokemon) => a.id - b.id).forEach(async (pokemon) => await displayCard(pokemon));
    } catch (err) {
        console.error(err);
    }
}

//* ------------------------ Fetch Pokémon by Name ------------------------

async function fetchPokemonByName(name: string): Promise<void> {
    try {
        displayCardsWrapper.innerHTML = '';
        pokemonDataArr = [];

        const url = `${BASE_URL}/pokemon/${name.toLowerCase()}`;
        const response = await fetch(url);

        if (!response.ok) {
            displayCardsWrapper.innerHTML = '<p>Pokémon not found</p>';
            return;
        }

        const pokemon = await response.json() as IPokemon;
        pokemonDataArr.push(pokemon);

        await displayCard(pokemon);
    } catch (err) {
        console.error(err);
        displayCardsWrapper.innerHTML = '<p>Error when searching for Pokémon</p>';
    }
}

//* ------------------------ Page Navigation Functions ------------------------
function nextPage(): void {
    currentPage++;
    loadPage();
}

function previousPage(): void {
    if (currentPage > 0) {
        currentPage--;
        loadPage();
    } else {
        loadPage();
    }
}

//* ------------------------ Events ------------------------

typeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const pokeType = button.className.toLowerCase();
        fetchPokemonByType(pokeType);
    });
});

let searchTimeout: number;

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);

    const pokemonName = searchInput.value.trim().toLowerCase();

    if (pokemonName) {
        searchTimeout = setTimeout(() => {
            fetchPokemonByName(pokemonName);
        }, 800);
    } else {
        loadPage(); 
    }
});

nextButtons.forEach((button) => button.addEventListener('click', nextPage))
prevButtons.forEach((button) => button.addEventListener('click', previousPage))

//* ------------------------ Initial Load ------------------------
loadPage();
