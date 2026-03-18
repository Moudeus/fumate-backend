import { MailService } from "./mail.service";
import { Request, Response } from "express";
import { ApiResponseWrapper } from "../../interfaces/ApiResponseWrapper";

export class MailController {
  static sendTokenMail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email || email.trim() === "") {
        return res.status(400).json(ApiResponseWrapper.error("Email is required"));
      }
      const token = await MailService.generateAndSendToken(String(email));
      return res.status(200).json(ApiResponseWrapper.success("Token sent successfully", { token }));
    } catch (error) {
      return res.status(500).json(ApiResponseWrapper.error("Internal Server Error"));
    }
  };
}
