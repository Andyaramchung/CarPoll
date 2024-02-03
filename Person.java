import java.util.ArrayList;
import java.util.Scanner;
public class Person{
    //Instance Variables
    private String name;
    private int age;
    private ArrayList<Person> friends;
    private String address;
    private ArrayList<String> personalTraits;
    private String phoneNumber;
    //Constructor
    public Person(String name, int age, String phoneNumber, String address, ) {
        this.name = name;
        this.age = age;
        this.phoneNumber = phoneNumber;
        friends = new ArrayList<Person>();
        personalTraits = new ArrayList<String>();
    }
    //Methods
    public String getName(){
        return name;
    }
    public int getAge(){
        return age;
    }
    public void changeName(String n){
        name = n;
    }
    public void changeAge(int a){
        age = a;
    }
    public void addPersonality(String s){
        personalTraits.add(s);
    }
    public void removePersonality(){
        for(int i = 0;i<personalTraits.size(); i++){
            System.out.println(i+1 + ". " + personalTraits.get(i));
        }
        System.out.println("Which personality trait do you want to remove?");
        Scanner s = new Scanner(System.in);
        int rem = s.nextInt();
        personalTraits.remove(rem);
    }
    public void getPersonalityTraits(){
        System.out.println("Personality:");
        for(int i = 0;i<personalTraits.size(); i++){
            System.out.println(i+1 + ". " + personalTraits.get(i));
        }
    }
    public void addFriend(Person p){
        friends.add(p);
    }
    public void removeFriend(Person p){
        friends.remove(p);
    }
    public void getFriends(){
        System.out.println(name + " has " + friends.size() + " friends.");
        System.out.println("Friends:");
        for(int i = 0; i<friends.size(); i++){
            System.out.println(friends.get(i));
        }
    }
    public void setAddress(String s){
        address = s;
    }
    public String getAddress(){
        return address;
    }
    public String getphoneNumber(){
        return phoneNumber;
    }
    public void changePhoneNumber(String s){
        phoneNumber = s;
    }
    public String toString(){
        return "User " + name + " is " + age + " years old.";
    }
}