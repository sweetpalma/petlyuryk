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
 * Restful Message statistics provider.
 */
export const routerMessage = (
	Router()
);


/**
 * GET Query message list.
 */
routerMessage.get('/', async (req, res) => {
	const { search, offset, limit } = parseQuery(req);
	const [ total, ...docs ] = await store.message.search(search, 'LIMIT', offset, limit);
	res.json({ data: { total, docs } });
});


/**
 * GET Message information by ID.
 */
routerMessage.get('/:id', async (req, res) => {
	const { id } = req.params;
	const info = await store.message.read(id);
	res.json({ data: { info } });
});
