/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { Router } from 'express';
import { Store } from '../store';
import { parseQuery } from '.';


/**
 * Redis Store.
 */
const store = (
	new Store()
);


/**
 * Restful Chat statistics provider.
 */
export const routerChat = (
	Router()
);


/**
 * GET Query chat list.
 */
routerChat.get('/', async (req, res) => {
	const { search, offset, limit } = parseQuery(req);
	const [ total, ...docs ] = await store.chat.search(search, 'LIMIT', offset, limit, 'SORTBY', 'members', 'DESC');
	res.json({ data: { total, docs } });
});


/**
 * GET Chat stats like messages processed.
 */
routerChat.get('/stats', async (req, res) => {
	const data = await store.chat.stats();
	res.json({ data });
});


/**
 * GET Chat information by ID.
 */
routerChat.get('/:id', async (req, res) => {
	const { id } = req.params;
	const info = await store.chat.read(id);
	res.json({ data: { info } });
});


/**
 * GET Chat information by ID.
 */
routerChat.delete('/:id', async (req, res) => {
	const { id } = req.params;
	await store.chat.delete(id);
	res.json({ data: null });
});
