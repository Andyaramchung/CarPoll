import java.util.Scanner;

public class Main{
    public static void main(String[] args){
        Scanner s = new Scanner(System.in);
        System.out.println("Welcome to: ");
        System.out.println("  #####                ######                       ");
        System.out.println(" #     #   ##   #####  #     #  ####  #      #      ");
        System.out.println(" #        #  #  #    # #     # #    # #      #      ");
        System.out.println(" #       #    # #    # ######  #    # #      #      ");
        System.out.println(" #       ###### # # #  #       #    # #      #      ");
        System.out.println(" #     # #    # #   #  #       #    # #      #      ");
        System.out.println("  #####  #    # #    # #        ####  ###### ###### ");
        System.out.println("                                                    ");
        System.out.println("v0.1a, (c) Andrew Chung, Kimi Wei, Kym Calderon, and Shuxin Huang");
        System.out.println("Press any key to continue...");
        try
        {
            System.in.read();
        }
        catch(Exception e)
        {}
        boolean running = true;
        while(running = true) {
            System.out.println("Choose one:");
            System.out.println("1. Make a new user");
            System.out.println("2. Log In");
            int choice = s.nextInt();
            switch(choice) {
                case 1:
                    System.out.println("Please enter your name:");
                    String name = s.next();
                    System.out.println("Please enter your age:");
                    int age = s.nextInt();
                    System.out.println("Please enter your phone number:");
                    String username = s.next();
                    System.out.println("Please enter your Address");
                    System.out.println("Formatted as [# and Street] [city],[ST] [ZIP]");
                    String address = s.next();
                    break;
                case 2:
                    System.out.println("woof");
                    break;
                default:
                    System.out.println("No such animal.");
                    break;
            }

        }
    }
}