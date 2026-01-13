import joi from "joi";


export const createImageMiddleware = async (req, res, next) => {

    // console.log(req.body)

    if (req.body && typeof req.body.tags === "string") {
        try {
            req.body.tags = JSON.parse(req.body.tags);
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid JSON format in 'tags' field" });
        };
    };

    if (req.body && typeof req.body.people === "string") {
        try {
            req.body.people = JSON.parse(req.body.people);
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid JSON format in 'person' field" });
        };
    };

    try {
        const schema = joi.object({
            name: joi.string().min(3).max(20).trim().optional().empty(""),
            tags: joi.array().items(joi.string().min(3).max(15).trim()).optional().empty(""),
            people: joi.array().items(joi.string().min(3).max(15).trim()).optional().empty("")
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