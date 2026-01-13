import joi from "joi";

export const createAlbumMiddleware = async (req, res, next) => {

    if (req.body && typeof req.body.sharedUsers === "string") {
        try {
            req.body.sharedUsers = JSON.parse(req.body.sharedUsers);
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid JSON format in 'shared Users' field" });
        };
    };

    try {
        const schema = joi.object({
            name: joi.string().min(5).max(30).trim().required(),
            description: joi.string().min(10).max(100).trim().optional().empty(""),
            sharedUsers: joi.array().items(joi.string().email().min(11).max(40).trim()).optional().empty("")
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ success: false, message: error?.details?.[0]?.message });
        };

        next();

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};

export const updateAlbumDescriptionMiddleware = async (req, res, next) => {
    try {
        const schema = joi.object({
            description: joi.string().min(5).max(100).trim().required()
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ success: false, message: error?.details?.[0]?.message });
        };

        next();

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};

export const updateTheSharedAlbumMiddleware = async (req, res, next) => {
    if (req.body && typeof req.body.sharedUsers === "string") {
        try {
            req.body.sharedUsers = JSON.parse(req.body.sharedUsers);
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid JSON format in 'shared Users' field" });
        };
    };
    try {
        const schema = joi.object({
            sharedUsers: joi.array().items(joi.string().email().min(3).max(40).trim()).required()
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ success: false, message: error?.details?.[0]?.message });
        };

        next();

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};