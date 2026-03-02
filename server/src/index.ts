import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// Prisma 7 setup with local driver adapter
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false // Common fix for cloud DB connection issues in local dev
    }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root route for health check
app.get('/', (req, res) => {
    res.send('Product Management API is running...');
});

// API Endpoints

// Create Product
app.post('/api/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, price, stock } = req.body;

        if (!name || price === undefined || stock === undefined) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                stock: parseInt(stock),
            },
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

// List Products (with search and pagination)
app.get('/api/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search = '', page = '1', limit = '10' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: {
                    name: {
                        contains: search as string,
                        mode: 'insensitive',
                    },
                },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({
                where: {
                    name: {
                        contains: search as string,
                        mode: 'insensitive',
                    },
                },
            }),
        ]);

        res.json({
            products,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
});

// Update Product
app.put('/api/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const { name, price, stock } = req.body;

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price: price !== undefined ? parseFloat(price) : undefined,
                stock: stock !== undefined ? parseInt(stock) : undefined,
            },
        });

        res.json(product);
    } catch (error) {
        next(error);
    }
});

// Delete Product
app.delete('/api/products/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
